"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { getHeaderLinks } from "@/lib/navigation";
import { AppIcon } from "@/lib/icons";
import { useAuth } from "./AuthProvider";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

const PUBLIC_PATHS = ["/access", "/login", "/register"];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isAuthenticated, isStaff, isUpravnik, role, logout } = useAuth();
  const unread = useUnreadMessages();

  if (PUBLIC_PATHS.includes(pathname)) return null;

  const desktopLinks = role ? getHeaderLinks(role) : [];
  const hasAdminInNav = desktopLinks.some((l) => l.href === "/uprava");

  return (
    <header className="sticky top-0 z-40 bg-ht-navy-dark shadow-[0_2px_20px_rgba(9,26,46,0.3)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" data-track="nav.header.home" data-track-label="Početna" className="flex min-w-0 items-center gap-3.5">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-ht-gold/40 bg-ht-navy text-xs font-bold tracking-[0.15em] text-ht-gold-light"
            aria-hidden="true"
          >
            VH
          </div>
          <div className="min-w-0">
            <p className="ht-display truncate text-lg leading-tight text-white sm:text-xl">
              {APP_NAME}
            </p>
            {isAuthenticated && session && (
              <p className="truncate text-xs text-white/60 sm:text-sm">
                {session.fullName}
                {session.room && ` · Soba ${session.room}`}
              </p>
            )}
          </div>
        </Link>

        {isAuthenticated && (
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <nav className="hidden items-center lg:flex" aria-label="Desktop navigacija">
              {desktopLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-track={`nav.header.${link.href}`}
                  data-track-label={link.label}
                  className={`touch-target relative inline-flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
                    pathname.startsWith(link.href) && link.href !== "/"
                      ? "text-ht-gold-light"
                      : link.href === "/" && pathname === "/"
                        ? "text-ht-gold-light"
                        : "text-white/70 hover:text-white"
                  }`}
                >
                  <AppIcon name={link.icon} className="h-3.5 w-3.5" />
                  {link.label}
                  {link.href === "/poruke" && unread > 0 && (
                    <span className="ml-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-ht-gold px-1 text-[0.65rem] font-bold text-ht-navy-dark">
                      {unread}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
            {isStaff && !hasAdminInNav && (
              <Link
                href="/uprava"
                className="touch-target hidden items-center gap-1.5 border border-ht-gold/30 px-3 py-1.5 text-sm text-ht-gold-light transition-colors hover:border-ht-gold/60 sm:flex"
              >
                <AppIcon name={isUpravnik ? "shield" : "clock"} className="h-3.5 w-3.5" />
                {isUpravnik ? "Panel upravnika" : "Dežurna evidencija"}
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="touch-target inline-flex px-2 py-1.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              Promeni ulogu
            </button>
            <button
              type="button"
              onClick={logout}
              data-track="action.logout"
              data-track-label="Odjava"
              className="touch-target px-3 py-1.5 text-sm text-white/60 transition-colors hover:text-white"
            >
              Odjava
            </button>
          </div>
        )}
      </div>
      <div className="ht-gold-rule-wide h-px opacity-40" />
    </header>
  );
}
