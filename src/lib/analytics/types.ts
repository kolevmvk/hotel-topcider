import type { UserRole } from "@/lib/types";

export type AnalyticsCategory =
  | "security"
  | "navigation"
  | "interaction"
  | "business";

export type AnalyticsActorType = "anonymous" | "access_user" | "app_user";

export type AnalyticsDeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export interface AnalyticsEvent {
  id: string;
  category: AnalyticsCategory;
  eventName: string;
  success?: boolean | null;
  timestamp: string;
  actorType: AnalyticsActorType;
  actorId?: string;
  actorRole?: UserRole;
  actorLabel?: string;
  room?: string;
  visitId?: string;
  sessionId?: string;
  path?: string;
  referrer?: string;
  targetId?: string;
  targetLabel?: string;
  deviceType: AnalyticsDeviceType;
  os?: string;
  browser?: string;
  isPwa: boolean;
  viewportW?: number;
  viewportH?: number;
  ipAddress?: string;
  userAgent?: string;
  isBot: boolean;
  metadata?: Record<string, unknown>;
}

export interface ClientAnalyticsPayload {
  category: AnalyticsCategory;
  eventName: string;
  success?: boolean;
  actorType?: AnalyticsActorType;
  actorId?: string;
  actorRole?: UserRole;
  actorLabel?: string;
  room?: string;
  visitId?: string;
  sessionId?: string;
  path?: string;
  referrer?: string;
  targetId?: string;
  targetLabel?: string;
  deviceTypeHint?: AnalyticsDeviceType;
  isPwa?: boolean;
  viewportW?: number;
  viewportH?: number;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsListFilters {
  from?: string;
  to?: string;
  category?: AnalyticsCategory;
  eventName?: string;
  deviceType?: AnalyticsDeviceType;
  actorRole?: UserRole;
  actorId?: string;
  isBot?: boolean;
  success?: boolean;
  limit?: number;
}

export interface AnalyticsSummary {
  totalEvents: number;
  pageViews: number;
  uniqueVisits: number;
  mobileCount: number;
  tabletCount: number;
  desktopCount: number;
  botAttempts: number;
  failedSecurity: number;
  topPaths: { path: string; count: number }[];
  topTargets: { targetId: string; count: number }[];
}

export interface AnalyticsAdapter {
  append(event: AnalyticsEvent): Promise<void>;
  appendBatch(events: AnalyticsEvent[]): Promise<void>;
  list(filters?: AnalyticsListFilters): Promise<AnalyticsEvent[]>;
  summary(since?: string): Promise<AnalyticsSummary>;
}
