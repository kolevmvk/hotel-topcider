import type { AnalyticsDeviceType } from "./types";

export function getClientDeviceHint(): AnalyticsDeviceType {
  if (typeof window === "undefined") return "unknown";

  const ua = navigator.userAgent;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 768px)").matches;
  const wide = window.matchMedia("(min-width: 1024px)").matches;

  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobile|iphone|android/i.test(ua) && !/ipad/i.test(ua)) return "mobile";
  if (coarse && narrow) return "mobile";
  if (coarse && !narrow) return "tablet";
  if (wide) return "desktop";
  if (window.innerWidth >= 1024) return "desktop";
  if (window.innerWidth >= 768) return "tablet";
  return "mobile";
}

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function getViewportSize(): { w: number; h: number } {
  if (typeof window === "undefined") return { w: 0, h: 0 };
  return { w: window.innerWidth, h: window.innerHeight };
}
