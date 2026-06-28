import { promises as fs } from "fs";
import path from "path";
import type {
  AnalyticsAdapter,
  AnalyticsEvent,
  AnalyticsListFilters,
  AnalyticsSummary,
} from "../types";

const DATA_DIR = path.join(process.cwd(), ".data");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics-events.json");
const MAX_ENTRIES = 5000;

const memoryStore: AnalyticsEvent[] = [];

async function ensureDataDir(): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

async function readFileEvents(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await fs.readFile(ANALYTICS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as AnalyticsEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFileEvents(events: AnalyticsEvent[]): Promise<boolean> {
  try {
    await ensureDataDir();
    await fs.writeFile(
      ANALYTICS_FILE,
      JSON.stringify(events.slice(-MAX_ENTRIES), null, 2),
      "utf-8"
    );
    return true;
  } catch {
    return false;
  }
}

function applyFilters(events: AnalyticsEvent[], filters?: AnalyticsListFilters): AnalyticsEvent[] {
  let result = [...events];

  if (filters?.from) {
    const from = filters.from;
    result = result.filter((e) => e.timestamp >= from);
  }
  if (filters?.to) {
    const to = filters.to;
    result = result.filter((e) => e.timestamp <= to);
  }
  if (filters?.category) {
    result = result.filter((e) => e.category === filters.category);
  }
  if (filters?.eventName) {
    result = result.filter((e) => e.eventName === filters.eventName);
  }
  if (filters?.deviceType) {
    result = result.filter((e) => e.deviceType === filters.deviceType);
  }
  if (filters?.actorRole) {
    result = result.filter((e) => e.actorRole === filters.actorRole);
  }
  if (filters?.actorId) {
    result = result.filter((e) => e.actorId === filters.actorId);
  }
  if (filters?.isBot === true) {
    result = result.filter((e) => e.isBot);
  }
  if (filters?.success === false) {
    result = result.filter((e) => e.success === false);
  }
  if (filters?.success === true) {
    result = result.filter((e) => e.success === true);
  }

  result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const limit = filters?.limit ?? 200;
  return result.slice(0, limit);
}

function buildSummary(events: AnalyticsEvent[], since?: string): AnalyticsSummary {
  const scoped = since ? events.filter((e) => e.timestamp >= since) : events;
  const pageViews = scoped.filter(
    (e) => e.category === "navigation" && e.eventName === "page_view"
  );
  const visitIds = new Set(pageViews.map((e) => e.visitId).filter(Boolean));

  const pathCounts = new Map<string, number>();
  for (const e of pageViews) {
    const p = e.path || "/";
    pathCounts.set(p, (pathCounts.get(p) ?? 0) + 1);
  }

  const targetCounts = new Map<string, number>();
  for (const e of scoped.filter((x) => x.category === "interaction")) {
    const id = e.targetId || e.targetLabel || "unknown";
    targetCounts.set(id, (targetCounts.get(id) ?? 0) + 1);
  }

  return {
    totalEvents: scoped.length,
    pageViews: pageViews.length,
    uniqueVisits: visitIds.size,
    mobileCount: scoped.filter((e) => e.deviceType === "mobile").length,
    tabletCount: scoped.filter((e) => e.deviceType === "tablet").length,
    desktopCount: scoped.filter((e) => e.deviceType === "desktop").length,
    botAttempts: scoped.filter((e) => e.isBot).length,
    failedSecurity: scoped.filter(
      (e) => e.category === "security" && e.success === false
    ).length,
    topPaths: [...pathCounts.entries()]
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topTargets: [...targetCounts.entries()]
      .map(([targetId, count]) => ({ targetId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  };
}

async function mergedEvents(): Promise<AnalyticsEvent[]> {
  const fileEvents = await readFileEvents();
  const byId = new Map<string, AnalyticsEvent>();
  for (const e of [...fileEvents, ...memoryStore]) {
    byId.set(e.id, e);
  }
  return Array.from(byId.values()).sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp)
  );
}

export class CompositeAnalyticsAdapter implements AnalyticsAdapter {
  async append(event: AnalyticsEvent): Promise<void> {
    memoryStore.push(event);
    if (memoryStore.length > MAX_ENTRIES) {
      memoryStore.splice(0, memoryStore.length - MAX_ENTRIES);
    }
    const fileEvents = await readFileEvents();
    fileEvents.push(event);
    await writeFileEvents(fileEvents);
  }

  async appendBatch(events: AnalyticsEvent[]): Promise<void> {
    for (const event of events) {
      await this.append(event);
    }
  }

  async list(filters?: AnalyticsListFilters): Promise<AnalyticsEvent[]> {
    const all = await mergedEvents();
    return applyFilters(all, filters);
  }

  async summary(since?: string): Promise<AnalyticsSummary> {
    const all = await mergedEvents();
    return buildSummary(all, since);
  }
}

let compositeInstance: CompositeAnalyticsAdapter | null = null;

export function getCompositeAnalyticsAdapter(): CompositeAnalyticsAdapter {
  if (!compositeInstance) {
    compositeInstance = new CompositeAnalyticsAdapter();
  }
  return compositeInstance;
}
