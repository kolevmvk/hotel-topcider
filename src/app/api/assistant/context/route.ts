import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  buildDefaultGreeting,
  getAssistantProfile,
  getConsentText,
  isAssistantEnabled,
  isDemoMode,
} from "@/lib/assistant/access-profiles";
import { checkOllamaAvailable } from "@/lib/assistant/ollama";
import { ACCESS_COOKIE_NAME } from "@/lib/access/constants";
import { verifyAccessSessionToken } from "@/lib/access/session";

export async function GET(request: NextRequest) {
  if (!isAssistantEnabled()) {
    return NextResponse.json({ enabled: false });
  }

  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const session = await verifyAccessSessionToken(token);

  if (!session.valid || !session.username) {
    return NextResponse.json({ error: "Potreban je pristup aplikaciji." }, { status: 401 });
  }

  const profile = getAssistantProfile(session.username);
  if (!profile) {
    return NextResponse.json({ error: "Profil nije pronađen." }, { status: 401 });
  }

  const ollamaAvailable = await checkOllamaAvailable();

  return NextResponse.json({
    enabled: true,
    ollamaAvailable,
    organization: profile.organization,
    audience: profile.audience,
    greeting: buildDefaultGreeting(profile),
    suggestedSteps: profile.suggestedSteps,
    demoMode: isDemoMode(),
    consentText: getConsentText(),
  });
}
