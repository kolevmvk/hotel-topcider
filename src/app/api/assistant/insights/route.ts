import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authorizeAnalyticsApi } from "@/lib/analytics/api-auth";
import { getAssistantStore } from "@/lib/assistant/service";

export async function GET(request: NextRequest) {
  const auth = await authorizeAnalyticsApi(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Nedozvoljen pristup." }, { status: auth.status });
  }

  const { searchParams } = request.nextUrl;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10) || 100, 500);
  const accessUsername = searchParams.get("username") ?? undefined;
  const sessionId = searchParams.get("sessionId") ?? undefined;

  const store = getAssistantStore();
  const sessions = await store.listSessions({ limit, accessUsername });

  if (sessionId) {
    const detail = sessions.find((s) => s.id === sessionId);
    if (!detail) {
      return NextResponse.json({ error: "Sesija nije pronađena." }, { status: 404 });
    }
    return NextResponse.json({ session: detail });
  }

  return NextResponse.json({ sessions });
}
