import { logAccessLoginEvent, logAppLoginEvent } from "@/lib/analytics/service";
import { getAuditAdapter } from "./adapters/composite-adapter";
import type {
  AccessLoginAuditInput,
  AppLoginAuditInput,
  AuditLogEntry,
} from "./types";

function generateAuditId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toLegacyEntryFromAccess(input: AccessLoginAuditInput): AuditLogEntry {
  return {
    id: generateAuditId(),
    type: "access_login",
    timestamp: new Date().toISOString(),
    success: input.success,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    referer: input.referer,
    path: input.path,
    method: input.method,
    username: input.username,
  };
}

function toLegacyEntryFromApp(input: AppLoginAuditInput): AuditLogEntry {
  return {
    id: generateAuditId(),
    type: "app_login",
    timestamp: new Date().toISOString(),
    success: input.success,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    referer: input.referer,
    path: input.path,
    method: input.method,
    loginType: input.loginType,
    identifier: input.identifier,
  };
}

export async function logAccessLogin(input: AccessLoginAuditInput): Promise<AuditLogEntry> {
  const entry = toLegacyEntryFromAccess(input);
  await getAuditAdapter().append(entry);

  const fakeRequest = new Request("http://local/audit", {
    headers: {
      "x-forwarded-for": input.ipAddress,
      "user-agent": input.userAgent,
      referer: input.referer ?? "",
    },
  });
  await logAccessLoginEvent(fakeRequest, {
    username: input.username,
    success: input.success,
    path: input.path,
    method: input.method,
  });

  return entry;
}

export async function logAppLogin(input: AppLoginAuditInput): Promise<AuditLogEntry> {
  const entry = toLegacyEntryFromApp(input);
  await getAuditAdapter().append(entry);

  const fakeRequest = new Request("http://local/audit", {
    headers: {
      "x-forwarded-for": input.ipAddress,
      "user-agent": input.userAgent,
      referer: input.referer ?? "",
    },
  });
  await logAppLoginEvent(fakeRequest, {
    loginType: input.loginType,
    identifier: input.identifier,
    success: input.success,
    path: input.path,
    method: input.method,
  });

  return entry;
}

export async function listAuditLogs(limit = 200): Promise<AuditLogEntry[]> {
  const { listSecurityAuditEntries } = await import("@/lib/analytics/service");
  const security = await listSecurityAuditEntries(limit);
  if (security.length > 0) return security;

  return getAuditAdapter().list(limit);
}
