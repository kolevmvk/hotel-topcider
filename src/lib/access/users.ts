export interface SiteAccessUser {
  username: string;
  password: string;
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
    return parsed.filter(
      (item): item is SiteAccessUser =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as SiteAccessUser).username === "string" &&
        typeof (item as SiteAccessUser).password === "string"
    );
  } catch {
    return [];
  }
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
