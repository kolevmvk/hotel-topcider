import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authorizeAnalyticsApi } from "@/lib/analytics/api-auth";
import { getAnalyticsSummary } from "@/lib/analytics/service";

export async function GET(request: NextRequest) {
  const auth = await authorizeAnalyticsApi(request);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 401 ? "Potreban je pristup." : "Nema ovlašćenja." },
      { status: auth.status }
    );
  }

  const sinceParam = request.nextUrl.searchParams.get("since");
  const since =
    sinceParam ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const summary = await getAnalyticsSummary(since);
  return NextResponse.json({ summary, since });
}
