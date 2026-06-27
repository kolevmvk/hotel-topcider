export type AuditEventType = "access_login" | "app_login";

export type AppLoginType = "stanar" | "dezurni" | "upravnik" | "gost";

export interface AuditLogEntry {
  id: string;
  type: AuditEventType;
  timestamp: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  referer?: string;
  path?: string;
  method?: string;
  /** access_login — korisničko ime pristupa */
  username?: string;
  /** app_login */
  loginType?: AppLoginType;
  /** app_login — soba ili username aplikacije (nikad PIN/password) */
  identifier?: string;
}

export interface AccessLoginAuditInput {
  username: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  referer?: string;
  path?: string;
  method?: string;
}

export interface AppLoginAuditInput {
  loginType: AppLoginType;
  identifier: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  referer?: string;
  path?: string;
  method?: string;
}

export interface AuditAdapter {
  append(entry: AuditLogEntry): Promise<void>;
  list(limit?: number): Promise<AuditLogEntry[]>;
}
