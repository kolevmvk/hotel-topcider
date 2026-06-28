import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authorizeAnalyticsApi } from "@/lib/analytics/api-auth";
import { listAnalyticsEvents } from "@/lib/analytics/service";
import type {
  AnalyticsCategory,
  AnalyticsDeviceType,
} from "@/lib/analytics/types";
import type { UserRole } from "@/lib/types";

export async function GET(request: NextRequest) {
  const auth = await authorizeAnalyticsApi(request);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 401 ? "Potreban je pristup." : "Nema ovlašćenja." },
      { status: auth.status }
    );
  }

  const sp = request.nextUrl.searchParams;
  const limitParam = sp.get("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 200, 500) : 200;

  const logs = await listAnalyticsEvents({
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    category: (sp.get("category") as AnalyticsCategory | null) ?? undefined,
    eventName: sp.get("eventName") ?? undefined,
    deviceType: (sp.get("device") as AnalyticsDeviceType | null) ?? undefined,
    actorRole: (sp.get("actorRole") as UserRole | null) ?? undefined,
    actorId: sp.get("actorId") ?? undefined,
    isBot: sp.get("isBot") === "true" ? true : undefined,
    success:
      sp.get("success") === "false"
        ? false
        : sp.get("success") === "true"
          ? true
          : undefined,
    limit,
  });

  return NextResponse.json({ logs });
}
