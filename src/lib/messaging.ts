import type { HotelTask, Message, Session, ShiftLog } from "./types";
import { STAFF_IDS } from "./types";

function isResidentRole(role: Session["role"]): boolean {
  return role === "stanar" || role === "gost";
}

export function getMessagesForSession(session: Session, all: Message[]): Message[] {
  if (isResidentRole(session.role)) {
    return all.filter(
      (m) =>
        (m.toUserId === session.userId &&
          (m.toRole === "stanar" || m.toRole === "gost")) ||
        (m.fromUserId === session.userId &&
          (m.fromRole === "stanar" || m.fromRole === "gost"))
    );
  }

  if (session.role === "upravnik") {
    return all.filter(
      (m) =>
        m.fromRole === "upravnik" ||
        m.toRole === "upravnik" ||
        m.fromUserId === STAFF_IDS.UPRAVNIK ||
        m.toUserId === STAFF_IDS.UPRAVNIK
    );
  }

  if (session.role === "dezurni") {
    return all.filter(
      (m) =>
        m.fromRole === "dezurni" ||
        m.toRole === "dezurni" ||
        m.fromUserId === STAFF_IDS.DEZURNI ||
        m.toUserId === STAFF_IDS.DEZURNI
    );
  }

  return [];
}

export function getUnreadCount(session: Session, all: Message[]): number {
  return getMessagesForSession(session, all).filter((m) => {
    const isRecipient = isResidentRole(session.role)
      ? m.toUserId === session.userId
      : session.role === "upravnik"
        ? m.toRole === "upravnik" || m.toUserId === STAFF_IDS.UPRAVNIK
        : m.toRole === "dezurni" || m.toUserId === STAFF_IDS.DEZURNI;

    return isRecipient && !m.procitanoAt;
  }).length;
}

export function getInboxMessages(session: Session, all: Message[]): Message[] {
  return getMessagesForSession(session, all)
    .filter((m) => {
      if (isResidentRole(session.role)) return m.toUserId === session.userId;
      if (session.role === "upravnik")
        return m.toRole === "upravnik" || m.toUserId === STAFF_IDS.UPRAVNIK;
      return m.toRole === "dezurni" || m.toUserId === STAFF_IDS.DEZURNI;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getSentMessages(session: Session, all: Message[]): Message[] {
  return getMessagesForSession(session, all)
    .filter((m) => m.fromUserId === session.userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function formatMessageParty(m: Message, perspective: "from" | "to"): string {
  if (perspective === "from") {
    return m.fromRoom ? `${m.fromName} · Soba ${m.fromRoom}` : m.fromName;
  }
  return m.toName;
}

export function taskStatusLabel(status: HotelTask["status"]): string {
  return status;
}

export function shiftLogTypeLabel(tip: ShiftLog["tip"]): string {
  const labels: Record<ShiftLog["tip"], string> = {
    zapažanje: "Zapažanje",
    primedba: "Primedba",
    info: "Informacija",
  };
  return labels[tip];
}
