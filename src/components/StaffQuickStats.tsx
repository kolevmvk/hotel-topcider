"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppIcon, ChevronRight } from "@/lib/icons";
import { upravaTabHref } from "@/lib/navigation";
import { getProblems, getUsers } from "@/lib/storage";
import { useAuth } from "./AuthProvider";

export default function StaffQuickStats() {
  const { isUpravnik, isDezurni } = useAuth();
  const [openCount, setOpenCount] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [needsConfirm, setNeedsConfirm] = useState(0);

  useEffect(() => {
    const problems = getProblems();
    setOpenCount(problems.filter((p) => p.status !== "Rešeno").length);
    setNeedsConfirm(problems.filter((p) => !p.dezurniPotvrda && p.status !== "Rešeno").length);
    if (isUpravnik) {
      setPendingUsers(getUsers().filter((u) => u.status === "pending").length);
    }
  }, [isUpravnik]);

  const items = [
    {
      show: true,
      label: "Otvorene prijave",
      value: openCount,
      href: "/moje-prijave",
      icon: "clipboard" as const,
    },
    {
      show: isDezurni,
      label: "Čeka potvrdu mera",
      value: needsConfirm,
      href: upravaTabHref("problems"),
      icon: "clock" as const,
    },
    {
      show: isUpravnik,
      label: "Na odobrenju",
      value: pendingUsers,
      href: upravaTabHref("people"),
      icon: "users" as const,
    },
  ].filter((i) => i.show && i.value > 0);

  if (items.length === 0) return null;

  return (
    <section aria-label="Brzi pregled" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="ht-panel-bordered flex items-center gap-4 p-4 transition-colors hover:bg-ht-cream/30 sm:p-5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-ht-border-light bg-ht-cream/40 text-ht-navy">
            <AppIcon name={item.icon} className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ht-muted">{item.label}</p>
            <p className="ht-display text-2xl text-ht-navy">{item.value}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-ht-gold" strokeWidth={1.75} />
        </Link>
      ))}
    </section>
  );
}
