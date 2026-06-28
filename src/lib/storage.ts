import { STORAGE_KEYS, INFO_SECTIONS } from "./constants";
import { mockNotices } from "./mockNotices";
import type {
  DezurniPotvrda,
  HotelTask,
  Message,
  Notice,
  ProblemReport,
  ShiftLog,
  TaskCompletion,
  TaskObservation,
  User,
  InfoSection,
} from "./types";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getItem<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeItem(key: string): void {
  if (!isBrowser()) return;
  localStorage.removeItem(key);
}

export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, []).map((u) => ({
    ...u,
    status: u.status ?? "active",
  }));
}

export function saveUsers(users: User[]): void {
  setItem(STORAGE_KEYS.USERS, users);
}

export function getUserByRoom(room: string): User | undefined {
  return getUsers().find((u) => u.room === room.trim());
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

export function roomExists(room: string): boolean {
  return getUsers().some(
    (u) => u.room === room.trim() && (u.status === "active" || u.status === "pending")
  );
}

export function updateUserStatus(userId: string, status: User["status"]): void {
  saveUsers(getUsers().map((u) => (u.id === userId ? { ...u, status } : u)));
}

export function getPendingUsers(): User[] {
  return getUsers().filter((u) => u.status === "pending" && u.role === "stanar");
}

export function getProblems(): ProblemReport[] {
  return getItem<ProblemReport[]>(STORAGE_KEYS.PROBLEMS, []);
}

export function saveProblems(problems: ProblemReport[]): void {
  setItem(STORAGE_KEYS.PROBLEMS, problems);
}

export function addProblem(problem: ProblemReport): void {
  const problems = getProblems();
  problems.unshift(problem);
  saveProblems(problems);
}

export function updateProblemStatus(
  id: string,
  status: ProblemReport["status"]
): void {
  const problems = getProblems().map((p) =>
    p.id === id ? { ...p, status } : p
  );
  saveProblems(problems);
}

export function updateDezurniPotvrda(
  id: string,
  potvrda: DezurniPotvrda
): void {
  const problems = getProblems().map((p) =>
    p.id === id ? { ...p, dezurniPotvrda: potvrda } : p
  );
  saveProblems(problems);
}

export function getProblemsByUserId(userId: string): ProblemReport[] {
  return getProblems().filter((p) => p.userId === userId);
}

export function ensureNoticesSeeded(): void {
  const existing = getItem<Notice[] | null>(STORAGE_KEYS.NOTICES, null);
  if (existing && existing.length > 0) return;
  setItem(STORAGE_KEYS.NOTICES, mockNotices);
}

export function getNotices(): Notice[] {
  ensureNoticesSeeded();
  const notices = getItem<Notice[]>(STORAGE_KEYS.NOTICES, mockNotices);
  return notices.map((n) => ({
    ...n,
    aktivno: n.aktivno ?? true,
    createdAt: n.createdAt ?? n.datum,
  }));
}

export function saveNotices(notices: Notice[]): void {
  setItem(STORAGE_KEYS.NOTICES, notices);
}

export function addNotice(notice: Notice): void {
  const notices = getNotices();
  notices.unshift(notice);
  saveNotices(notices);
}

export function updateNotice(id: string, updates: Partial<Notice>): void {
  const notices = getNotices().map((n) =>
    n.id === id ? { ...n, ...updates } : n
  );
  saveNotices(notices);
}

export function deleteNotice(id: string): void {
  saveNotices(getNotices().filter((n) => n.id !== id));
}

export function getTasks(): HotelTask[] {
  return getItem<HotelTask[]>(STORAGE_KEYS.TASKS, []).map((t) => ({
    ...t,
    zapazanja: t.zapazanja ?? [],
  }));
}

export function saveTasks(tasks: HotelTask[]): void {
  setItem(STORAGE_KEYS.TASKS, tasks);
}

export function addTask(task: HotelTask): void {
  const tasks = getTasks();
  tasks.unshift(task);
  saveTasks(tasks);
}

export function updateTask(id: string, updates: Partial<HotelTask>): void {
  saveTasks(getTasks().map((t) => (t.id === id ? { ...t, ...updates } : t)));
}

export function addTaskObservation(taskId: string, observation: TaskObservation): void {
  saveTasks(
    getTasks().map((t) =>
      t.id === taskId ? { ...t, zapazanja: [...t.zapazanja, observation] } : t
    )
  );
}

export function setTaskCompletion(taskId: string, completion: TaskCompletion): void {
  saveTasks(
    getTasks().map((t) =>
      t.id === taskId ? { ...t, izvrsenje: completion, status: "Izvršen" as const } : t
    )
  );
}

export function getMessages(): Message[] {
  return getItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
}

export function saveMessages(messages: Message[]): void {
  setItem(STORAGE_KEYS.MESSAGES, messages);
  if (isBrowser()) {
    window.dispatchEvent(new Event("ht-messages-updated"));
  }
}

export function addMessage(message: Message): void {
  const messages = getMessages();
  messages.unshift(message);
  saveMessages(messages);
}

export function markMessageRead(id: string): void {
  saveMessages(
    getMessages().map((m) =>
      m.id === id ? { ...m, procitanoAt: new Date().toISOString() } : m
    )
  );
}

export function getShiftLogs(): ShiftLog[] {
  return getItem<ShiftLog[]>(STORAGE_KEYS.SHIFT_LOGS, []);
}

export function saveShiftLogs(logs: ShiftLog[]): void {
  setItem(STORAGE_KEYS.SHIFT_LOGS, logs);
}

export function addShiftLog(log: ShiftLog): void {
  const logs = getShiftLogs();
  logs.unshift(log);
  saveShiftLogs(logs);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_INFO_SECTIONS: InfoSection[] = INFO_SECTIONS.map((s) => ({ ...s }));

function ensureInfoSectionsSeeded(): void {
  const existing = getItem<InfoSection[] | null>(STORAGE_KEYS.INFO_SECTIONS, null);
  if (existing && existing.length > 0) return;
  setItem(STORAGE_KEYS.INFO_SECTIONS, DEFAULT_INFO_SECTIONS);
}

export function getInfoSections(): InfoSection[] {
  ensureInfoSectionsSeeded();
  return getItem<InfoSection[]>(STORAGE_KEYS.INFO_SECTIONS, DEFAULT_INFO_SECTIONS);
}

export function updateInfoSection(
  id: string,
  updates: Partial<Pick<InfoSection, "title" | "content" | "icon">>
): void {
  setItem(
    STORAGE_KEYS.INFO_SECTIONS,
    getInfoSections().map((s) => (s.id === id ? { ...s, ...updates } : s))
  );
}

export function addInfoSection(section: InfoSection): void {
  setItem(STORAGE_KEYS.INFO_SECTIONS, [...getInfoSections(), section]);
}

export function deleteInfoSection(id: string): void {
  setItem(
    STORAGE_KEYS.INFO_SECTIONS,
    getInfoSections().filter((s) => s.id !== id)
  );
}
