import { STORAGE_KEYS } from "./constants";
import {
  DEMO_HANDOVERS,
  DEMO_MESSAGES,
  DEMO_PROBLEMS,
  DEMO_ROOMS,
  DEMO_SEED_VERSION,
  DEMO_SHIFT_LOGS,
  DEMO_TASKS,
  DEMO_USERS,
} from "./demoData";
import {
  getItem,
  getMessages,
  getProblems,
  getShiftLogs,
  getTasks,
  getUsers,
  saveMessages,
  saveProblems,
  saveShiftLogs,
  saveTasks,
  saveUsers,
  setItem,
} from "./storage";
import { saveHandovers, saveRooms, getRooms, getHandovers } from "./rooms";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function ensureDemoData(): void {
  if (!isBrowser()) return;

  const hasDemoUsers = getUsers().some((u) => u.id.startsWith("demo-"));
  const hasDemoProblems = getProblems().some((p) => p.id.startsWith("demo-"));
  const hasDemoRooms = getRooms().some((r) => r.id.startsWith("demo-room"));
  const version = getItem<string>(STORAGE_KEYS.DEMO_VERSION, "");

  if (
    version === DEMO_SEED_VERSION &&
    hasDemoUsers &&
    hasDemoProblems &&
    hasDemoRooms &&
    getTasks().some((t) => t.id.startsWith("demo-"))
  ) {
    return;
  }

  const existingUsers = getUsers().filter((u) => !u.id.startsWith("demo-"));
  const demoRooms = new Set(DEMO_USERS.map((u) => u.room));
  const nonDemoWithoutConflict = existingUsers.filter((u) => !demoRooms.has(u.room));

  saveUsers([...nonDemoWithoutConflict, ...DEMO_USERS]);

  const existingProblems = getProblems().filter((p) => !p.id.startsWith("demo-"));
  saveProblems([...DEMO_PROBLEMS, ...existingProblems]);

  const existingTasks = getTasks().filter((t) => !t.id.startsWith("demo-"));
  saveTasks([...DEMO_TASKS, ...existingTasks]);

  const existingMessages = getMessages().filter((m) => !m.id.startsWith("demo-"));
  saveMessages([...DEMO_MESSAGES, ...existingMessages]);

  const existingLogs = getShiftLogs().filter((l) => !l.id.startsWith("demo-"));
  saveShiftLogs([...DEMO_SHIFT_LOGS, ...existingLogs]);

  const existingRooms = getRooms().filter((r) => !r.id.startsWith("demo-room"));
  saveRooms([...DEMO_ROOMS, ...existingRooms]);

  const existingHandovers = getHandovers().filter(
    (h) => !h.id.startsWith("demo-handover")
  );
  saveHandovers([...DEMO_HANDOVERS, ...existingHandovers]);

  setItem(STORAGE_KEYS.DEMO_VERSION, DEMO_SEED_VERSION);
}

export function resetDemoData(): void {
  if (!isBrowser()) return;

  const existingUsers = getUsers().filter((u) => !u.id.startsWith("demo-"));
  const existingProblems = getProblems().filter((p) => !p.id.startsWith("demo-"));
  const existingTasks = getTasks().filter((t) => !t.id.startsWith("demo-"));
  const existingMessages = getMessages().filter((m) => !m.id.startsWith("demo-"));
  const existingLogs = getShiftLogs().filter((l) => !l.id.startsWith("demo-"));
  const existingRooms = getRooms().filter((r) => !r.id.startsWith("demo-room"));
  const existingHandovers = getHandovers().filter(
    (h) => !h.id.startsWith("demo-handover")
  );

  saveUsers([...existingUsers, ...DEMO_USERS]);
  saveProblems([...DEMO_PROBLEMS, ...existingProblems]);
  saveTasks([...DEMO_TASKS, ...existingTasks]);
  saveMessages([...DEMO_MESSAGES, ...existingMessages]);
  saveShiftLogs([...DEMO_SHIFT_LOGS, ...existingLogs]);
  saveRooms([...DEMO_ROOMS, ...existingRooms]);
  saveHandovers([...DEMO_HANDOVERS, ...existingHandovers]);
  setItem(STORAGE_KEYS.DEMO_VERSION, DEMO_SEED_VERSION);
}
