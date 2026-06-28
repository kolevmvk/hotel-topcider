import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const LOCKOUT_FILE = path.join(DATA_DIR, "access-lockouts.json");

export interface AccessLockoutRecord {
  ip: string;
  failures: number;
  lastFailureAt: string;
  lockedUntil?: string;
}

const memory = new Map<string, AccessLockoutRecord>();

function failuresBeforeCaptcha(): number {
  return parseInt(process.env.ACCESS_CAPTCHA_AFTER_FAILURES ?? "2", 10) || 2;
}

function failuresBeforeLockout(): number {
  return parseInt(process.env.ACCESS_LOCKOUT_AFTER_FAILURES ?? "5", 10) || 5;
}

function lockoutDurationSec(): number {
  return parseInt(process.env.ACCESS_LOCKOUT_SECONDS ?? "900", 10) || 900;
}

function baseCooldownSec(): number {
  return parseInt(process.env.ACCESS_RETRY_BASE_SECONDS ?? "30", 10) || 30;
}

function maxCooldownSec(): number {
  return parseInt(process.env.ACCESS_RETRY_MAX_SECONDS ?? "600", 10) || 600;
}

async function readFileRecords(): Promise<AccessLockoutRecord[]> {
  try {
    const raw = await fs.readFile(LOCKOUT_FILE, "utf-8");
    const parsed = JSON.parse(raw) as AccessLockoutRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFileRecords(records: AccessLockoutRecord[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(LOCKOUT_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch {
    /* read-only / serverless */
  }
}

async function getRecord(ip: string): Promise<AccessLockoutRecord | null> {
  if (memory.has(ip)) return memory.get(ip)!;

  const fileRecords = await readFileRecords();
  const found = fileRecords.find((r) => r.ip === ip);
  if (found) memory.set(ip, found);
  return found ?? null;
}

async function saveRecord(record: AccessLockoutRecord): Promise<void> {
  memory.set(record.ip, record);
  const fileRecords = await readFileRecords();
  const idx = fileRecords.findIndex((r) => r.ip === record.ip);
  if (idx >= 0) fileRecords[idx] = record;
  else fileRecords.push(record);
  await writeFileRecords(fileRecords.slice(-5000));
}

export async function clearAccessLockout(ip: string): Promise<void> {
  memory.delete(ip);
  const fileRecords = await readFileRecords();
  await writeFileRecords(fileRecords.filter((r) => r.ip !== ip));
}

function cooldownForFailures(failures: number): number {
  if (failures <= 0) return 0;
  return Math.min(baseCooldownSec() * failures, maxCooldownSec());
}

export interface AccessGateStatus {
  failures: number;
  retryAfterSec: number;
  requireCaptcha: boolean;
  locked: boolean;
}

export async function getAccessGateStatus(ip: string): Promise<AccessGateStatus> {
  const record = await getRecord(ip);
  const now = Date.now();

  if (!record || record.failures === 0) {
    return { failures: 0, retryAfterSec: 0, requireCaptcha: false, locked: false };
  }

  let retryAfterSec = 0;
  let locked = false;

  if (record.lockedUntil) {
    const lockedMs = new Date(record.lockedUntil).getTime() - now;
    if (lockedMs > 0) {
      retryAfterSec = Math.ceil(lockedMs / 1000);
      locked = true;
    }
  }

  if (!locked && record.lastFailureAt) {
    const cooldownMs =
      new Date(record.lastFailureAt).getTime() +
      cooldownForFailures(record.failures) * 1000 -
      now;
    if (cooldownMs > 0) {
      retryAfterSec = Math.max(retryAfterSec, Math.ceil(cooldownMs / 1000));
    }
  }

  return {
    failures: record.failures,
    retryAfterSec,
    requireCaptcha: record.failures >= failuresBeforeCaptcha(),
    locked,
  };
}

export async function recordAccessFailure(ip: string): Promise<AccessGateStatus> {
  const now = new Date();
  const existing = (await getRecord(ip)) ?? {
    ip,
    failures: 0,
    lastFailureAt: now.toISOString(),
  };

  existing.failures += 1;
  existing.lastFailureAt = now.toISOString();

  if (existing.failures >= failuresBeforeLockout()) {
    existing.lockedUntil = new Date(
      now.getTime() + lockoutDurationSec() * 1000
    ).toISOString();
  }

  await saveRecord(existing);
  return getAccessGateStatus(ip);
}
