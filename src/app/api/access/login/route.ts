import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_SESSION_MAX_AGE_SEC,
} from "@/lib/access/constants";
import {
  clearAccessLockout,
  getAccessGateStatus,
  recordAccessFailure,
} from "@/lib/access/lockout";
import { isRecaptchaConfigured, verifyRecaptchaToken } from "@/lib/access/recaptcha";
import { createAccessSessionToken } from "@/lib/access/session";
import { validateSiteAccessCredentials } from "@/lib/access/users";
import { getRequestMeta } from "@/lib/audit/request-meta";
import { logAccessLogin } from "@/lib/audit/service";

export async function POST(request: NextRequest) {
  const meta = getRequestMeta(request);
  const ip = meta.ipAddress;

  const gate = await getAccessGateStatus(ip);
  if (gate.retryAfterSec > 0) {
    return NextResponse.json(
      {
        error: gate.locked
          ? "Previše neuspešnih pokušaja. Sačekajte pre ponovnog pristupa."
          : "Sačekajte pre sledećeg pokušaja.",
        retryAfterSec: gate.retryAfterSec,
        requireCaptcha: gate.requireCaptcha,
        failures: gate.failures,
      },
      { status: 429 }
    );
  }

  let body: { username?: string; password?: string; recaptchaToken?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "Neispravan zahtev." },
      { status: 400 }
    );
  }

  const username = (body.username ?? "").trim();
  const password = body.password ?? "";

  if (gate.requireCaptcha && isRecaptchaConfigured()) {
    const captchaOk = await verifyRecaptchaToken(body.recaptchaToken);
    if (!captchaOk) {
      return NextResponse.json(
        {
          error: "Potvrdite da niste robot (reCAPTCHA).",
          requireCaptcha: true,
          failures: gate.failures,
        },
        { status: 400 }
      );
    }
  }

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
    const afterFail = await recordAccessFailure(ip);
    return NextResponse.json(
      {
        error: "Neispravni pristupni podaci.",
        retryAfterSec: afterFail.retryAfterSec,
        requireCaptcha: afterFail.requireCaptcha,
        failures: afterFail.failures,
      },
      { status: 401 }
    );
  }

  await clearAccessLockout(ip);

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
