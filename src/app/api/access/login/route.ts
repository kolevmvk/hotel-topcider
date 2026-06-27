import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_SESSION_MAX_AGE_SEC,
} from "@/lib/access/constants";
import { createAccessSessionToken } from "@/lib/access/session";
import { validateSiteAccessCredentials } from "@/lib/access/users";
import { getRequestMeta } from "@/lib/audit/request-meta";
import { logAccessLogin } from "@/lib/audit/service";

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json(
      { error: "Neispravni pristupni podaci." },
      { status: 400 }
    );
  }

  const username = (body.username ?? "").trim();
  const password = body.password ?? "";
  const meta = getRequestMeta(request);

  const success = validateSiteAccessCredentials(username, password);

  await logAccessLogin({
    username: username || "(prazno)",
    success,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    referer: meta.referer,
    path: request.nextUrl.pathname,
    method: "POST",
  });

  if (!success) {
    return NextResponse.json(
      { error: "Neispravni pristupni podaci." },
      { status: 401 }
    );
  }

  const token = await createAccessSessionToken(username);
  const response = NextResponse.json({ ok: true, redirectTo: "/login" });

  response.cookies.set(ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_SESSION_MAX_AGE_SEC,
  });

  return response;
}
