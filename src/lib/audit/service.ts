import { getAuditAdapter } from "./adapters/composite-adapter";
import type {
  AccessLoginAuditInput,
  AppLoginAuditInput,
  AuditLogEntry,
} from "./types";

function generateAuditId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function logAccessLogin(input: AccessLoginAuditInput): Promise<AuditLogEntry> {
  const entry: AuditLogEntry = {
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

  await getAuditAdapter().append(entry);
  return entry;
}

export async function logAppLogin(input: AppLoginAuditInput): Promise<AuditLogEntry> {
  const entry: AuditLogEntry = {
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

  await getAuditAdapter().append(entry);
  return entry;
}

export async function listAuditLogs(limit = 200): Promise<AuditLogEntry[]> {
  return getAuditAdapter().list(limit);
}
