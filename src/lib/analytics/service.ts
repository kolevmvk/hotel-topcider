import type { AppLoginType } from "@/lib/audit/types";
import type {
  AnalyticsAdapter,
  AnalyticsEvent,
  AnalyticsListFilters,
  AnalyticsSummary,
  ClientAnalyticsPayload,
} from "./types";
import { getCompositeAnalyticsAdapter } from "./adapters/composite-adapter";
import { getSupabaseAnalyticsAdapter } from "./adapters/supabase-adapter";
import { enrichClientPayload, enrichSecurityEvent } from "./enrich";

function isSupabaseBackendEnabled(): boolean {
  return (
    process.env.ANALYTICS_BACKEND === "supabase" &&
    Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

function getAdapter(): AnalyticsAdapter {
  if (isSupabaseBackendEnabled()) {
    const supabase = getSupabaseAnalyticsAdapter();
    if (supabase) return supabase;
  }
  return getCompositeAnalyticsAdapter();
}

async function writeWithFallback(events: AnalyticsEvent[]): Promise<void> {
  const primary = getAdapter();
  try {
    if (events.length === 1) {
      await primary.append(events[0]);
    } else {
      await primary.appendBatch(events);
    }
    return;
  } catch {
    if (isSupabaseBackendEnabled()) {
      const fallback = getCompositeAnalyticsAdapter();
      if (events.length === 1) {
        await fallback.append(events[0]);
      } else {
        await fallback.appendBatch(events);
      }
    }
  }
}

export async function ingestClientEvents(
  request: Request,
  payloads: ClientAnalyticsPayload[]
): Promise<AnalyticsEvent[]> {
  const events = payloads.map((p) => enrichClientPayload(request, p));
  await writeWithFallback(events);
  return events;
}

export async function logSecurityEvent(
  request: Request,
  input: {
    eventName: string;
    success?: boolean;
    path?: string;
    method?: string;
    actorLabel?: string;
    actorType?: AnalyticsEvent["actorType"];
    metadata?: Record<string, unknown>;
  }
): Promise<AnalyticsEvent> {
  const event = enrichSecurityEvent(request, input);
  await writeWithFallback([event]);
  return event;
}

export async function logAccessLoginEvent(
  request: Request,
  input: { username: string; success: boolean; path?: string; method?: string }
): Promise<AnalyticsEvent> {
  return logSecurityEvent(request, {
    eventName: "access.login",
    success: input.success,
    path: input.path,
    method: input.method,
    actorType: input.success ? "access_user" : "anonymous",
    actorLabel: input.username,
    metadata: { username: input.username },
  });
}

export async function logAppLoginEvent(
  request: Request,
  input: {
    loginType: AppLoginType;
    identifier: string;
    success: boolean;
    path?: string;
    method?: string;
  }
): Promise<AnalyticsEvent> {
  return logSecurityEvent(request, {
    eventName: "app.login",
    success: input.success,
    path: input.path,
    method: input.method,
    actorType: input.success ? "app_user" : "anonymous",
    actorLabel: input.identifier,
    metadata: { loginType: input.loginType, identifier: input.identifier },
  });
}

export async function listAnalyticsEvents(
  filters?: AnalyticsListFilters
): Promise<AnalyticsEvent[]> {
  return getAdapter().list(filters);
}

export async function getAnalyticsSummary(since?: string): Promise<AnalyticsSummary> {
  return getAdapter().summary(since);
}

/** Backward-compatible audit list for AccessAuditPanel */
export async function listSecurityAuditEntries(limit = 200) {
  const events = await listAnalyticsEvents({
    category: "security",
    limit,
  });
  return events.map((e) => ({
    id: e.id,
    type:
      e.eventName === "access.login"
        ? ("access_login" as const)
        : e.eventName === "app.login"
          ? ("app_login" as const)
          : ("access_login" as const),
    timestamp: e.timestamp,
    success: e.success ?? false,
    ipAddress: e.ipAddress ?? "",
    userAgent: e.userAgent ?? "",
    referer: e.referrer,
    path: e.path,
    method: (e.metadata?.method as string | undefined) ?? undefined,
    username:
      e.eventName === "access.login"
        ? (e.metadata?.username as string | undefined) ?? e.actorLabel
        : undefined,
    loginType:
      e.eventName === "app.login"
        ? (e.metadata?.loginType as AppLoginType | undefined)
        : undefined,
    identifier:
      e.eventName === "app.login"
        ? (e.metadata?.identifier as string | undefined) ?? e.actorLabel
        : undefined,
  }));
}
