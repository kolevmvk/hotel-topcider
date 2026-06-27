"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getUnreadCount } from "@/lib/messaging";
import { getMessages } from "@/lib/storage";
import { useAuth } from "@/components/AuthProvider";

export function useUnreadMessages(): number {
  const { session } = useAuth();
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    function refresh() {
      if (!session) {
        setCount(0);
        return;
      }
      setCount(getUnreadCount(session, getMessages()));
    }

    refresh();
    window.addEventListener("ht-messages-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ht-messages-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [session, pathname]);

  return count;
}
