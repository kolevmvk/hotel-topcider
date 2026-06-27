import { promises as fs } from "fs";
import path from "path";
import type { AuditAdapter, AuditLogEntry } from "../types";

const DATA_DIR = path.join(process.cwd(), ".data");
const AUDIT_FILE = path.join(DATA_DIR, "audit-logs.json");
const MAX_ENTRIES = 2000;

/** In-memory fallback za serverless / read-only okruženja */
const memoryStore: AuditLogEntry[] = [];

async function ensureDataDir(): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

async function readFileLogs(): Promise<AuditLogEntry[]> {
  try {
    const raw = await fs.readFile(AUDIT_FILE, "utf-8");
    const parsed = JSON.parse(raw) as AuditLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFileLogs(entries: AuditLogEntry[]): Promise<boolean> {
  try {
    await ensureDataDir();
    const trimmed = entries.slice(-MAX_ENTRIES);
    await fs.writeFile(AUDIT_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}

/**
 * MVP adapter: file (.data/audit-logs.json) + in-memory fallback.
 * Zamena: SupabaseAuditAdapter implementira isti AuditAdapter interfejs.
 */
export class CompositeAuditAdapter implements AuditAdapter {
  async append(entry: AuditLogEntry): Promise<void> {
    memoryStore.push(entry);
    if (memoryStore.length > MAX_ENTRIES) {
      memoryStore.splice(0, memoryStore.length - MAX_ENTRIES);
    }

    const fileLogs = await readFileLogs();
    fileLogs.push(entry);
    await writeFileLogs(fileLogs);
  }

  async list(limit = 200): Promise<AuditLogEntry[]> {
    const fileLogs = await readFileLogs();
    const merged = [...fileLogs, ...memoryStore];
    const byId = new Map<string, AuditLogEntry>();
    for (const entry of merged) {
      byId.set(entry.id, entry);
    }
    return Array.from(byId.values())
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }
}

let adapterInstance: CompositeAuditAdapter | null = null;

export function getAuditAdapter(): AuditAdapter {
  if (!adapterInstance) {
    adapterInstance = new CompositeAuditAdapter();
  }
  return adapterInstance;
}
