import { randomUUID } from "crypto";
import { UAParser } from "ua-parser-js";
import { getRequestMeta } from "@/lib/audit/request-meta";
import type {
  AnalyticsDeviceType,
  AnalyticsEvent,
  ClientAnalyticsPayload,
} from "./types";
import { isProbableBot } from "./bot";

function generateEventId(): string {
  return randomUUID();
}

function resolveDeviceType(
  userAgent: string,
  hint?: AnalyticsDeviceType
): AnalyticsDeviceType {
  const parser = new UAParser(userAgent);
  const type = parser.getDevice().type;
  if (type === "mobile") return "mobile";
  if (type === "tablet") return "tablet";
  if (type === "console" || type === "smarttv") return "desktop";
  if (hint && hint !== "unknown") return hint;

  const os = parser.getOS().name?.toLowerCase() ?? "";
  if (/android|ios|iphone|ipad|mobile/i.test(userAgent) || os.includes("android")) {
    return /ipad|tablet/i.test(userAgent) ? "tablet" : "mobile";
  }
  if (userAgent && userAgent.length > 10) return "desktop";
  return "unknown";
}

export function enrichClientPayload(
  request: Request,
  payload: ClientAnalyticsPayload
): AnalyticsEvent {
  const meta = getRequestMeta(request);
  const userAgent = meta.userAgent;
  const parser = new UAParser(userAgent);
  const os = parser.getOS();
  const browser = parser.getBrowser();

  return {
    id: generateEventId(),
    category: payload.category,
    eventName: payload.eventName,
    success: payload.success ?? null,
    timestamp: new Date().toISOString(),
    actorType: payload.actorType ?? "anonymous",
    actorId: payload.actorId,
    actorRole: payload.actorRole,
    actorLabel: payload.actorLabel,
    room: payload.room,
    visitId: payload.visitId,
    sessionId: payload.sessionId,
    path: payload.path,
    referrer: payload.referrer ?? meta.referer,
    targetId: payload.targetId,
    targetLabel: payload.targetLabel,
    deviceType: resolveDeviceType(userAgent, payload.deviceTypeHint),
    os: os.name ? `${os.name}${os.version ? ` ${os.version}` : ""}`.trim() : undefined,
    browser: browser.name
      ? `${browser.name}${browser.version ? ` ${browser.version}` : ""}`.trim()
      : undefined,
    isPwa: payload.isPwa ?? false,
    viewportW: payload.viewportW,
    viewportH: payload.viewportH,
    ipAddress: meta.ipAddress,
    userAgent,
    isBot: isProbableBot(userAgent),
    metadata: payload.metadata ?? {},
  };
}

export function enrichSecurityEvent(
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
): AnalyticsEvent {
  const meta = getRequestMeta(request);
  const userAgent = meta.userAgent;
  const parser = new UAParser(userAgent);
  const os = parser.getOS();
  const browser = parser.getBrowser();

  return {
    id: generateEventId(),
    category: "security",
    eventName: input.eventName,
    success: input.success ?? null,
    timestamp: new Date().toISOString(),
    actorType: input.actorType ?? "anonymous",
    actorLabel: input.actorLabel,
    path: input.path,
    referrer: meta.referer,
    deviceType: resolveDeviceType(userAgent),
    os: os.name ? `${os.name}${os.version ? ` ${os.version}` : ""}`.trim() : undefined,
    browser: browser.name
      ? `${browser.name}${browser.version ? ` ${browser.version}` : ""}`.trim()
      : undefined,
    isPwa: false,
    ipAddress: meta.ipAddress,
    userAgent,
    isBot: isProbableBot(userAgent),
    metadata: { ...(input.metadata ?? {}), method: input.method },
  };
}
