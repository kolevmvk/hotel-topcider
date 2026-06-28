import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/access/constants";
import { verifyAccessSessionToken } from "@/lib/access/session";
import { listSecurityAuditEntries } from "@/lib/analytics/service";
import type { AppLoginType } from "@/lib/audit/types";
import { getRequestMeta } from "@/lib/audit/request-meta";
import { logAppLogin } from "@/lib/audit/service";

const VALID_LOGIN_TYPES: AppLoginType[] = ["stanar", "dezurni", "upravnik", "gost"];

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const session = await verifyAccessSessionToken(token);
  if (!session.valid) {
    return NextResponse.json({ error: "Potreban je pristup aplikaciji." }, { status: 401 });
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 200, 500) : 200;
  const logs = await listSecurityAuditEntries(limit);
  return NextResponse.json({ logs });
}

export async function POST(request: NextRequest) {
  let body: {
    loginType?: string;
    identifier?: string;
    success?: boolean;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const loginType = body.loginType as AppLoginType;
  const identifier = (body.identifier ?? "").trim();
  const success = Boolean(body.success);

  if (!VALID_LOGIN_TYPES.includes(loginType) || !identifier) {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const meta = getRequestMeta(request);

  const entry = await logAppLogin({
    loginType,
    identifier,
    success,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    referer: meta.referer,
    path: request.nextUrl.pathname,
    method: "POST",
  });

  return NextResponse.json({ ok: true, entry });
}
