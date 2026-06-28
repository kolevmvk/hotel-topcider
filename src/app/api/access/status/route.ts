import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAccessGateStatus } from "@/lib/access/lockout";
import { isRecaptchaConfigured } from "@/lib/access/recaptcha";
import { getClientIp } from "@/lib/audit/request-meta";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const status = await getAccessGateStatus(ip);

  return NextResponse.json({
    ...status,
    captchaEnabled: isRecaptchaConfigured(),
  });
}
