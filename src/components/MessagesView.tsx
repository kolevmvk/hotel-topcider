"use client";

import { useCallback, useEffect, useState } from "react";
import { UPRAVNIK_CREDENTIALS, DEZURNI_CREDENTIALS } from "@/lib/constants";
import { getInboxMessages, getSentMessages } from "@/lib/messaging";
import {
  addMessage,
  generateId,
  getMessages,
  getUsers,
  markMessageRead,
} from "@/lib/storage";
import type { Message, User } from "@/lib/types";
import { STAFF_IDS } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import EmptyState from "./EmptyState";
import MessageCard from "./MessageCard";
import { AppIcon } from "@/lib/icons";

type MailTab = "inbox" | "sent" | "compose";

type ComposeTarget = "upravnik" | "dezurni" | "stanar";

export default function MessagesView() {
  const { session, isResident, isUpravnik, isDezurni } = useAuth();
  const [tab, setTab] = useState<MailTab>("inbox");
  const [messages, setMessages] = useState<Message[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [naslov, setNaslov] = useState("");
  const [tekst, setTekst] = useState("");
  const [targetRole, setTargetRole] = useState<ComposeTarget>(
    isResident ? "upravnik" : "stanar"
  );
  const [targetUserId, setTargetUserId] = useState("");

  const refresh = useCallback(() => {
    const all = getMessages();
    setMessages(all);
    setUsers(
      getUsers().filter(
        (u) =>
          u.status === "active" &&
          (u.role === "stanar" || u.role === "gost" || u.role === "upravnik" || u.role === "dezurni")
      )
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const inbox = session ? getInboxMessages(session, messages) : [];
  const sent = session ? getSentMessages(session, messages) : [];

  function handleOpen(id: string) {
    markMessageRead(id);
    setExpandedId(expandedId === id ? null : id);
    refresh();
  }

  function handleCompose(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !naslov.trim() || !tekst.trim()) return;

    let toUserId = targetUserId;
    let toRole = targetRole as Message["toRole"];
    let toName = "";

    if (isResident) {
      if (targetRole === "upravnik") {
        toUserId = STAFF_IDS.UPRAVNIK;
        toRole = "upravnik";
        toName = UPRAVNIK_CREDENTIALS.displayName;
      } else {
        toUserId = STAFF_IDS.DEZURNI;
        toRole = "dezurni";
        toName = DEZURNI_CREDENTIALS.displayName;
      }
    } else if (isUpravnik && targetRole === "stanar") {
      const user = users.find((u) => u.id === targetUserId);
      if (!user) return;
      toUserId = user.id;
      toRole = user.role === "gost" ? "gost" : "stanar";
      toName = user.fullName;
    } else if (isDezurni && targetRole === "upravnik") {
      toUserId = STAFF_IDS.UPRAVNIK;
      toRole = "upravnik";
      toName = UPRAVNIK_CREDENTIALS.displayName;
    } else if (isDezurni && targetRole === "stanar") {
      const user = users.find((u) => u.id === targetUserId);
      if (!user) return;
      toUserId = user.id;
      toRole = user.role === "gost" ? "gost" : "stanar";
      toName = user.fullName;
    }

    addMessage({
      id: generateId(),
      fromUserId: session.userId,
      fromRole: session.role,
      fromName: session.fullName,
      fromRoom: session.room,
      toUserId,
      toRole,
      toName,
      naslov: naslov.trim(),
      tekst: tekst.trim(),
      createdAt: new Date().toISOString(),
    });

    setNaslov("");
    setTekst("");
    setTargetUserId("");
    setTab("sent");
    refresh();
  }

  function handleReply(message: Message) {
    const subject = message.naslov.startsWith("Re:")
      ? message.naslov
      : `Re: ${message.naslov}`;
    setNaslov(subject);
    if (isResident) {
      setTargetRole(message.fromRole === "upravnik" ? "upravnik" : "dezurni");
    } else if (message.fromRole === "stanar" || message.fromRole === "gost") {
      setTargetRole("stanar");
      setTargetUserId(message.fromUserId);
    } else if (message.fromRole === "upravnik") {
      setTargetRole(isUpravnik ? "stanar" : "upravnik");
    }
    setTab("compose");
  }

  const tabs: { key: MailTab; label: string }[] = [
    { key: "inbox", label: `Primljeno (${inbox.filter((m) => !m.procitanoAt).length})` },
    { key: "sent", label: "Poslato" },
    { key: "compose", label: "Nova poruka" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1 border-b border-ht-border-light pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`touch-target px-4 py-3 text-sm font-medium transition-colors sm:text-base ${
              tab === t.key
                ? "border-b-2 border-ht-gold text-ht-navy"
                : "text-ht-muted hover:text-ht-navy"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "inbox" && (
        <div className="space-y-3">
          {inbox.length === 0 ? (
            <EmptyState
              icon="mail"
              title="Nema poruka"
              description="Primljene poruke će se pojaviti ovde."
            />
          ) : (
            inbox.map((m) => (
              <div key={m.id} className="space-y-2">
                <MessageCard
                  message={m}
                  perspective="inbox"
                  expanded={expandedId === m.id}
                  onOpen={handleOpen}
                />
                {expandedId === m.id && (
                  <button
                    type="button"
                    onClick={() => handleReply(m)}
                    className="ht-btn-secondary touch-target ml-1 text-sm"
                  >
                    Odgovori
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "sent" && (
        <div className="space-y-3">
          {sent.length === 0 ? (
            <EmptyState
              icon="mail"
              title="Nema poslatih poruka"
              description="Poruke koje pošaljete biće evidentirane ovde."
            />
          ) : (
            sent.map((m) => (
              <MessageCard
                key={m.id}
                message={m}
                perspective="sent"
                expanded={expandedId === m.id}
                onOpen={(id) => setExpandedId(expandedId === id ? null : id)}
              />
            ))
          )}
        </div>
      )}

      {tab === "compose" && (
        <form onSubmit={handleCompose} className="ht-panel-bordered mx-auto max-w-xl space-y-5 p-6 sm:p-8">
          <h2 className="ht-display flex items-center gap-2 text-xl text-ht-navy">
            <AppIcon name="mail" className="h-5 w-5" />
            Nova poruka
          </h2>

          {isResident && (
            <div>
              <label htmlFor="to-staff" className="ht-field-label">Primalac</label>
              <select
                id="to-staff"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as ComposeTarget)}
                className="ht-input"
              >
                <option value="upravnik">Upravnik hotela</option>
                <option value="dezurni">Dežurna služba</option>
              </select>
            </div>
          )}

          {(isUpravnik || isDezurni) && (
            <div>
              <label htmlFor="to-role" className="ht-field-label">Primalac</label>
              <select
                id="to-role"
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value as ComposeTarget);
                  setTargetUserId("");
                }}
                className="ht-input"
              >
                {isUpravnik && (
                  <>
                    <option value="stanar">Stanar / gost (pojedinačno)</option>
                  </>
                )}
                {isDezurni && (
                  <>
                    <option value="upravnik">Upravnik hotela</option>
                    <option value="stanar">Stanar / gost (pojedinačno)</option>
                  </>
                )}
              </select>
            </div>
          )}

          {(targetRole === "stanar" && (isUpravnik || isDezurni)) && (
            <div>
              <label htmlFor="to-user" className="ht-field-label">Stanar ili gost</label>
              <select
                id="to-user"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                required
                className="ht-input"
              >
                <option value="">— Izaberite —</option>
                {users
                  .filter((u) => u.role === "stanar" || u.role === "gost")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} · Soba {u.room} ({u.role === "gost" ? "gost" : "stanar"})
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="msg-subject" className="ht-field-label">Naslov</label>
            <input
              id="msg-subject"
              value={naslov}
              onChange={(e) => setNaslov(e.target.value)}
              required
              className="ht-input"
              placeholder="Kratak naslov poruke"
            />
          </div>

          <div>
            <label htmlFor="msg-body" className="ht-field-label">Poruka</label>
            <textarea
              id="msg-body"
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              required
              rows={6}
              className="ht-input resize-y"
              placeholder="Unesite tekst poruke..."
            />
          </div>

          <button type="submit" className="ht-btn-primary inline-flex w-full items-center justify-center gap-2">
            <AppIcon name="mail" className="h-4 w-4" />
            Pošalji poruku
          </button>
        </form>
      )}
    </div>
  );
}
