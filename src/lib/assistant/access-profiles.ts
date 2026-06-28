import { parseSiteAccessUsers, type SiteAccessUser } from "@/lib/access/users";
import type { AssistantAudience, AssistantProfile } from "./types";

const CONSENT_TEXT =
  "Razgovor sa asistentom beleži se radi unapređenja digitalnog servisa. Ne delimo ga van institucije.";

export function getConsentText(): string {
  return CONSENT_TEXT;
}

function normalizeAudience(raw?: string): AssistantAudience {
  if (
    raw === "executive" ||
    raw === "operational" ||
    raw === "developer" ||
    raw === "general"
  ) {
    return raw;
  }
  return "general";
}

export function profileFromAccessUser(user: SiteAccessUser): AssistantProfile {
  return {
    username: user.username,
    label: user.label ?? user.username,
    organization: user.organization ?? user.label ?? user.username,
    audience: normalizeAudience(user.audience),
    greeting: user.greeting,
    suggestedSteps: user.suggestedSteps ?? [],
  };
}

export function getAssistantProfile(username: string): AssistantProfile | null {
  const user = parseSiteAccessUsers().find((u) => u.username === username);
  if (!user) return null;
  return profileFromAccessUser(user);
}

export function buildDefaultGreeting(profile: AssistantProfile): string {
  if (profile.greeting) return profile.greeting;

  const org = profile.organization;
  switch (profile.audience) {
    case "executive":
      return `Dobrodošli, ${org}. Ja sam asistent digitalnog servisa Vojnog hotela. Mogu da objasnim sistem ili da predložim pregled za rukovodstvo — recite šta vas zanima.`;
    case "operational":
      return `Dobrodošli, ${org}. Pomažem oko prijava, dežurne službe i svakodnevnog rada u aplikaciji. Šta biste prvo da pogledate?`;
    case "developer":
      return `Zdravo. Developer režim — mogu objasniti demo podatke, uloge, ograničenja i tehničke detalje prototipa.`;
    default:
      return `Dobrodošli u digitalni servis Vojnog hotela. Mogu da objasnim uloge i funkcije aplikacije — šta vas interesuje?`;
  }
}

export function isAssistantEnabled(): boolean {
  return process.env.ASSISTANT_ENABLED !== "false";
}

export function isDemoMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_SHOW_DEMO === "true" ||
    process.env.NODE_ENV === "development"
  );
}
