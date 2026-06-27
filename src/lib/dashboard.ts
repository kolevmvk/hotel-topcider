import { getProblems, getTasks, getUsers } from "./storage";
import { getPendingDezurniHandovers, getRooms, userHasCompletedPrijem, getHandovers, getRoomByNumber } from "./rooms";
import type { Session } from "./types";

export function getPendingHandoverCountForUser(userId: string): number {
  return getHandovers().filter(
    (h) => h.userId === userId && h.status === "ceka_korisnika"
  ).length;
}

export function userNeedsRoomCheckIn(session: Session): boolean {
  if (!session.room || (session.role !== "stanar" && session.role !== "gost")) {
    return false;
  }
  const room = getRoomByNumber(session.room);
  if (!room) return false;
  return !userHasCompletedPrijem(session.userId, room.id);
}

export function getShiftInboxCounts() {
  const handovers = getPendingDezurniHandovers().length;
  const problems = getProblems().filter(
    (p) => p.status !== "Rešeno" && !p.dezurniPotvrda
  ).length;
  const tasks = getTasks().filter((t) => t.status !== "Potvrđen").length;
  return { handovers, problems, tasks, total: handovers + problems + tasks };
}

export function getManagerDashboardCounts() {
  const problems = getProblems();
  const users = getUsers();
  const rooms = getRooms();
  const openProblems = problems.filter((p) => p.status !== "Rešeno").length;
  const pendingUsers = users.filter((u) => u.status === "pending").length;
  const activeGuests = users.filter((u) => u.role === "gost" && u.status === "active").length;
  const renovationRooms = rooms.filter(
    (r) => r.trebaRenoviranje || r.status === "renoviranje"
  ).length;
  return { openProblems, pendingUsers, activeGuests, renovationRooms };
}

export function getRoomOccupancyCounts() {
  const rooms = getRooms();
  return {
    zauzeta: rooms.filter((r) => r.status === "zauzeta").length,
    slobodna: rooms.filter((r) => r.status === "slobodna").length,
    renoviranje: rooms.filter((r) => r.status === "renoviranje").length,
    total: rooms.length,
  };
}

export function getResolvedProblemsLast7Days(): number {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return getProblems().filter(
    (p) => p.status === "Rešeno" && new Date(p.createdAt).getTime() >= weekAgo
  ).length;
}
