import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  AnalyticsAdapter,
  AnalyticsEvent,
  AnalyticsListFilters,
  AnalyticsSummary,
} from "../types";

type AnalyticsRow = {
  id: string;
  category: AnalyticsEvent["category"];
  event_name: string;
  success: boolean | null;
  timestamp: string;
  actor_type: AnalyticsEvent["actorType"];
  actor_id: string | null;
  actor_role: AnalyticsEvent["actorRole"] | null;
  actor_label: string | null;
  room: string | null;
  visit_id: string | null;
  session_id: string | null;
  path: string | null;
  referrer: string | null;
  target_id: string | null;
  target_label: string | null;
  device_type: AnalyticsEvent["deviceType"];
  os: string | null;
  browser: string | null;
  is_pwa: boolean;
  viewport_w: number | null;
  viewport_h: number | null;
  ip_address: string | null;
  user_agent: string | null;
  is_bot: boolean;
  metadata: Record<string, unknown> | null;
};

function rowToEvent(row: AnalyticsRow): AnalyticsEvent {
  return {
    id: row.id,
    category: row.category,
    eventName: row.event_name,
    success: row.success,
    timestamp: row.timestamp,
    actorType: row.actor_type,
    actorId: row.actor_id ?? undefined,
    actorRole: row.actor_role ?? undefined,
    actorLabel: row.actor_label ?? undefined,
    room: row.room ?? undefined,
    visitId: row.visit_id ?? undefined,
    sessionId: row.session_id ?? undefined,
    path: row.path ?? undefined,
    referrer: row.referrer ?? undefined,
    targetId: row.target_id ?? undefined,
    targetLabel: row.target_label ?? undefined,
    deviceType: row.device_type,
    os: row.os ?? undefined,
    browser: row.browser ?? undefined,
    isPwa: row.is_pwa,
    viewportW: row.viewport_w ?? undefined,
    viewportH: row.viewport_h ?? undefined,
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    isBot: row.is_bot,
    metadata: row.metadata ?? {},
  };
}

function eventToRow(event: AnalyticsEvent): AnalyticsRow {
  return {
    id: event.id,
    category: event.category,
    event_name: event.eventName,
    success: event.success ?? null,
    timestamp: event.timestamp,
    actor_type: event.actorType,
    actor_id: event.actorId ?? null,
    actor_role: event.actorRole ?? null,
    actor_label: event.actorLabel ?? null,
    room: event.room ?? null,
    visit_id: event.visitId ?? null,
    session_id: event.sessionId ?? null,
    path: event.path ?? null,
    referrer: event.referrer ?? null,
    target_id: event.targetId ?? null,
    target_label: event.targetLabel ?? null,
    device_type: event.deviceType,
    os: event.os ?? null,
    browser: event.browser ?? null,
    is_pwa: event.isPwa,
    viewport_w: event.viewportW ?? null,
    viewport_h: event.viewportH ?? null,
    ip_address: event.ipAddress ?? null,
    user_agent: event.userAgent ?? null,
    is_bot: event.isBot,
    metadata: event.metadata ?? {},
  };
}

function buildSummaryFromEvents(events: AnalyticsEvent[]): AnalyticsSummary {
  const pageViews = events.filter(
    (e) => e.category === "navigation" && e.eventName === "page_view"
  );
  const visitIds = new Set(pageViews.map((e) => e.visitId).filter(Boolean));
  const pathCounts = new Map<string, number>();
  for (const e of pageViews) {
    const p = e.path || "/";
    pathCounts.set(p, (pathCounts.get(p) ?? 0) + 1);
  }
  const targetCounts = new Map<string, number>();
  for (const e of events.filter((x) => x.category === "interaction")) {
    const id = e.targetId || e.targetLabel || "unknown";
    targetCounts.set(id, (targetCounts.get(id) ?? 0) + 1);
  }

  return {
    totalEvents: events.length,
    pageViews: pageViews.length,
    uniqueVisits: visitIds.size,
    mobileCount: events.filter((e) => e.deviceType === "mobile").length,
    tabletCount: events.filter((e) => e.deviceType === "tablet").length,
    desktopCount: events.filter((e) => e.deviceType === "desktop").length,
    botAttempts: events.filter((e) => e.isBot).length,
    failedSecurity: events.filter(
      (e) => e.category === "security" && e.success === false
    ).length,
    topPaths: [...pathCounts.entries()]
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topTargets: [...targetCounts.entries()]
      .map(([targetId, count]) => ({ targetId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  };
}

export class SupabaseAnalyticsAdapter implements AnalyticsAdapter {
  private client: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async append(event: AnalyticsEvent): Promise<void> {
    const { error } = await this.client
      .from("analytics_events")
      .insert(eventToRow(event));
    if (error) throw new Error(error.message);
  }

  async appendBatch(events: AnalyticsEvent[]): Promise<void> {
    if (events.length === 0) return;
    const { error } = await this.client
      .from("analytics_events")
      .insert(events.map(eventToRow));
    if (error) throw new Error(error.message);
  }

  async list(filters?: AnalyticsListFilters): Promise<AnalyticsEvent[]> {
    let query = this.client
      .from("analytics_events")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(filters?.limit ?? 200);

    if (filters?.from) query = query.gte("timestamp", filters.from);
    if (filters?.to) query = query.lte("timestamp", filters.to);
    if (filters?.category) query = query.eq("category", filters.category);
    if (filters?.eventName) query = query.eq("event_name", filters.eventName);
    if (filters?.deviceType) query = query.eq("device_type", filters.deviceType);
    if (filters?.actorRole) query = query.eq("actor_role", filters.actorRole);
    if (filters?.actorId) query = query.eq("actor_id", filters.actorId);
    if (filters?.isBot === true) query = query.eq("is_bot", true);
    if (filters?.success === false) query = query.eq("success", false);
    if (filters?.success === true) query = query.eq("success", true);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data as AnalyticsRow[]).map(rowToEvent);
  }

  async summary(since?: string): Promise<AnalyticsSummary> {
    let query = this.client
      .from("analytics_events")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(5000);

    if (since) query = query.gte("timestamp", since);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return buildSummaryFromEvents((data as AnalyticsRow[]).map(rowToEvent));
  }
}

let supabaseInstance: SupabaseAnalyticsAdapter | null = null;

export function getSupabaseAnalyticsAdapter(): SupabaseAnalyticsAdapter | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!supabaseInstance) {
    supabaseInstance = new SupabaseAnalyticsAdapter(url, key);
  }
  return supabaseInstance;
}
