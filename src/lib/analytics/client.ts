"use client";

import type { Session, UserRole } from "@/lib/types";
import type { AnalyticsCategory, ClientAnalyticsPayload } from "./types";
import { getClientDeviceHint, getViewportSize, isStandalonePwa } from "./device";
import { getVisitId } from "./visit";

const FLUSH_INTERVAL_MS = 3000;
const MAX_BATCH = 20;

const queue: ClientAnalyticsPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let actorContext: {
  actorType: ClientAnalyticsPayload["actorType"];
  actorId?: string;
  actorRole?: UserRole;
  actorLabel?: string;
  room?: string;
  sessionId?: string;
} = { actorType: "anonymous" };

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushAnalytics();
  }, FLUSH_INTERVAL_MS);
}

function basePayload(
  category: AnalyticsCategory,
  eventName: string,
  extra: Partial<ClientAnalyticsPayload> = {}
): ClientAnalyticsPayload {
  const { w, h } = getViewportSize();
  return {
    category,
    eventName,
    visitId: getVisitId(),
    path: typeof window !== "undefined" ? window.location.pathname : undefined,
    referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
    deviceTypeHint: getClientDeviceHint(),
    isPwa: isStandalonePwa(),
    viewportW: w,
    viewportH: h,
    actorType: actorContext.actorType,
    actorId: actorContext.actorId,
    actorRole: actorContext.actorRole,
    actorLabel: actorContext.actorLabel,
    room: actorContext.room,
    sessionId: actorContext.sessionId,
    ...extra,
  };
}

export function setAnalyticsActor(session: Session | null) {
  if (!session) {
    actorContext = { actorType: "anonymous" };
    return;
  }
  actorContext = {
    actorType: "app_user",
    actorId: session.userId,
    actorRole: session.role,
    actorLabel: session.fullName,
    room: session.room,
    sessionId: session.userId,
  };
}

export function trackInteraction(
  targetId: string,
  targetLabel?: string,
  metadata?: Record<string, unknown>
) {
  enqueue(
    basePayload("interaction", "click", {
      targetId,
      targetLabel,
      metadata,
    })
  );
}

export function trackPageView(path: string) {
  enqueue(
    basePayload("navigation", "page_view", {
      path,
      targetId: path,
      targetLabel: path,
    })
  );
}

export function trackBusiness(
  eventName: string,
  metadata?: Record<string, unknown>,
  targetId?: string,
  targetLabel?: string
) {
  enqueue(
    basePayload("business", eventName, {
      targetId,
      targetLabel,
      metadata,
    })
  );
}

function enqueue(payload: ClientAnalyticsPayload) {
  queue.push(payload);
  if (queue.length >= MAX_BATCH) {
    void flushAnalytics();
    return;
  }
  scheduleFlush();
}

export async function flushAnalytics() {
  if (queue.length === 0) return;
  const batch = queue.splice(0, MAX_BATCH);
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ events: batch })], {
        type: "application/json",
      });
      const sent = navigator.sendBeacon("/api/analytics/events", blob);
      if (sent) return;
    }
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    });
  } catch {
    queue.unshift(...batch);
  }
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flushAnalytics();
  });
  window.addEventListener("beforeunload", () => {
    void flushAnalytics();
  });
}
