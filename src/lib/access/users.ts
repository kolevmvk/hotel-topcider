export type SiteAccessAudience = "executive" | "operational" | "general" | "developer";

export interface SiteAccessUser {
  username: string;
  password: string;
  label?: string;
  organization?: string;
  audience?: SiteAccessAudience;
  greeting?: string;
  suggestedSteps?: string[];
}

function isSiteAccessUser(item: unknown): item is SiteAccessUser {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as SiteAccessUser).username === "string" &&
    typeof (item as SiteAccessUser).password === "string"
  );
}

export function parseSiteAccessUsers(): SiteAccessUser[] {
  const raw = process.env.SITE_ACCESS_USERS;
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isSiteAccessUser);
  } catch {
    return [];
  }
}

export function findSiteAccessUser(username: string): SiteAccessUser | undefined {
  return parseSiteAccessUsers().find((u) => u.username === username.trim());
}

export function validateSiteAccessCredentials(
  username: string,
  password: string
): boolean {
  const users = parseSiteAccessUsers();
  return users.some(
    (u) => u.username === username.trim() && u.password === password
  );
}
