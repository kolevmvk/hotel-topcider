"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  flushAnalytics,
  setAnalyticsActor,
  trackInteraction,
  trackPageView,
} from "@/lib/analytics/client";

const AUTO_SELECTORS =
  "nav a[href], button.ht-btn-primary, button.ht-btn-secondary, .ht-filter-chip";

function inferLabel(el: HTMLElement): string {
  const aria = el.getAttribute("aria-label");
  if (aria) return aria.slice(0, 80);
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  return text.slice(0, 80) || "unknown";
}

function shouldSkipAuto(el: HTMLElement): boolean {
  if (el.closest("[data-track-no-auto]")) return true;
  if (el.closest("input, textarea, select, label")) return true;
  const type = (el as HTMLButtonElement).type;
  if (type === "submit" && el.closest("form")) return true;
  return false;
}

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session } = useAuth();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    setAnalyticsActor(session);
  }, [session]);

  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    lastPath.current = pathname;
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const tracked = target.closest("[data-track]") as HTMLElement | null;
      if (tracked) {
        const id = tracked.getAttribute("data-track") ?? "unknown";
        const label =
          tracked.getAttribute("data-track-label") ?? inferLabel(tracked);
        trackInteraction(id, label);
        return;
      }

      const auto = target.closest(AUTO_SELECTORS) as HTMLElement | null;
      if (!auto || shouldSkipAuto(auto)) return;

      let id = auto.getAttribute("data-track");
      if (!id) {
        if (auto instanceof HTMLAnchorElement && auto.href) {
          id = `auto.link.${auto.getAttribute("href") ?? "unknown"}`;
        } else {
          id = `auto.button.${inferLabel(auto).toLowerCase().replace(/\s+/g, "_")}`;
        }
      }
      trackInteraction(id, inferLabel(auto));
    }

    document.addEventListener("click", onClick, { passive: true, capture: true });
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    return () => {
      void flushAnalytics();
    };
  }, []);

  return <>{children}</>;
}
