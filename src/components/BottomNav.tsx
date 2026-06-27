"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItems } from "@/lib/navigation";
import { getPendingHandoverCountForUser } from "@/lib/dashboard";
import { AppIcon } from "@/lib/icons";
import { useAuth } from "./AuthProvider";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

const PUBLIC_PATHS = ["/access", "/login", "/register"];

export default function BottomNav() {
  const pathname = usePathname();
  const { role, session } = useAuth();
  const unread = useUnreadMessages();

  if (PUBLIC_PATHS.includes(pathname) || !role) return null;

  const items = getNavItems(role);
  const pendingHandover =
    session && (role === "stanar" || role === "gost")
      ? getPendingHandoverCountForUser(session.userId)
      : 0;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-ht-border-light bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(9,26,46,0.08)] backdrop-blur-md lg:hidden"
      aria-label="Glavna navigacija"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const badge =
            item.href === "/poruke" && unread > 0
              ? unread
              : item.href === "/soba" && pendingHandover > 0
                ? pendingHandover
                : null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`touch-target relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[0.65rem] font-medium uppercase tracking-wide transition-colors ${
                isActive ? "text-ht-navy" : "text-ht-muted"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 h-0.5 w-8 bg-ht-gold" aria-hidden="true" />
              )}
              <span className="relative">
                <AppIcon name={item.icon} className="h-5 w-5" />
                {badge !== null && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-ht-navy px-1 text-[0.6rem] font-bold text-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span className="max-w-[4.5rem] truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
