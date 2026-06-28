import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getClientIp } from "@/lib/audit/request-meta";
import { checkRateLimit } from "@/lib/analytics/rate-limit";
import { ingestClientEvents } from "@/lib/analytics/service";
import type { ClientAnalyticsPayload } from "@/lib/analytics/types";

const MAX_EVENTS = 20;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`events:${ip}`)) {
    return NextResponse.json({ error: "Previše zahteva." }, { status: 429 });
  }

  let body: { events?: ClientAnalyticsPayload[] };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const events = body.events ?? [];
  if (!Array.isArray(events) || events.length === 0 || events.length > MAX_EVENTS) {
    return NextResponse.json({ error: "Neispravan batch." }, { status: 400 });
  }

  for (const e of events) {
    if (!e.category || !e.eventName) {
      return NextResponse.json({ error: "Nedostaje category/eventName." }, { status: 400 });
    }
  }

  const saved = await ingestClientEvents(request, events);
  return NextResponse.json({ ok: true, count: saved.length });
}
