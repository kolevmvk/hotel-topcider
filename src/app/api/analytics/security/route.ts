import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logSecurityEvent } from "@/lib/analytics/service";

export async function POST(request: NextRequest) {
  const secret = process.env.ANALYTICS_INTERNAL_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Nije konfigurisano." }, { status: 503 });
  }

  const header = request.headers.get("x-analytics-internal-secret");
  if (header !== secret) {
    return NextResponse.json({ error: "Zabranjeno." }, { status: 403 });
  }

  let body: {
    eventName?: string;
    success?: boolean;
    path?: string;
    method?: string;
    actorLabel?: string;
    metadata?: Record<string, unknown>;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  if (!body.eventName) {
    return NextResponse.json({ error: "Nedostaje eventName." }, { status: 400 });
  }

  const entry = await logSecurityEvent(request, {
    eventName: body.eventName,
    success: body.success,
    path: body.path,
    method: body.method,
    actorLabel: body.actorLabel,
    metadata: body.metadata,
  });

  return NextResponse.json({ ok: true, entry });
}
