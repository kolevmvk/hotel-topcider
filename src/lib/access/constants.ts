export const ACCESS_COOKIE_NAME = "ht_site_access";

/** Trajanje access sesije — 7 dana */
export const ACCESS_SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;

export const PUBLIC_PATHS = [
  "/access",
  "/api/access/login",
] as const;

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number])) {
    return true;
  }
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/images/") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  ) {
    return true;
  }
  return false;
}
