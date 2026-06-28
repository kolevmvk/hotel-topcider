import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME, isPublicPath } from "@/lib/access/constants";
import { verifyAccessSessionToken } from "@/lib/access/session";

function logAccessDenied(request: NextRequest, pathname: string, method: string) {
  const secret = process.env.ANALYTICS_INTERNAL_SECRET;
  if (!secret) return;

  const url = new URL("/api/analytics/security", request.url);
  void fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-analytics-internal-secret": secret,
      "x-forwarded-for":
        request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip") ??
        "unknown",
      "user-agent": request.headers.get("user-agent") ?? "unknown",
      referer: request.headers.get("referer") ?? "",
    },
    body: JSON.stringify({
      eventName: "access_denied",
      success: false,
      path: pathname,
      method,
    }),
  }).catch(() => undefined);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    if (pathname === "/access") {
      const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
      const session = await verifyAccessSessionToken(token);
      if (session.valid) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
      }
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const session = await verifyAccessSessionToken(token);

  if (!session.valid) {
    logAccessDenied(request, pathname, request.method);

    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Potreban je pristup aplikaciji." },
        { status: 401 }
      );
    }

    const accessUrl = request.nextUrl.clone();
    accessUrl.pathname = "/access";
    accessUrl.search = "";
    return NextResponse.redirect(accessUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
