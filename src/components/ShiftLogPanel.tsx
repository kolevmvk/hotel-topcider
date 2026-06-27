"use client";

import { useCallback, useEffect, useState } from "react";
import { SHIFT_LOG_TYPES } from "@/lib/constants";
import { AppIcon } from "@/lib/icons";
import { shiftLogTypeLabel } from "@/lib/messaging";
import {
  addShiftLog,
  generateId,
  getShiftLogs,
} from "@/lib/storage";
import type { ShiftLog, ShiftLogType } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import EmptyState from "./EmptyState";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ShiftLogPanel() {
  const { session, isDezurni, isUpravnik } = useAuth();
  const [logs, setLogs] = useState<ShiftLog[]>([]);
  const [tip, setTip] = useState<ShiftLogType>("zapažanje");
  const [tekst, setTekst] = useState("");
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(() => {
    setLogs(getShiftLogs());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !tekst.trim()) return;

    addShiftLog({
      id: generateId(),
      tip,
      tekst: tekst.trim(),
      createdAt: new Date().toISOString(),
      authorId: session.userId,
      authorName: session.fullName,
    });

    setTekst("");
    setShowForm(false);
    refresh();
  }

  return (
    <div className="space-y-4">
      {isDezurni && (
        <div>
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="ht-btn-primary inline-flex items-center gap-2"
            >
              <AppIcon name="report" className="h-4 w-4" />
              Novi zapis smene
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="ht-panel-bordered space-y-4 p-6">
              <h3 className="ht-display text-xl text-ht-navy">Zapažanje / primedba</h3>
              <div>
                <label htmlFor="log-type" className="ht-field-label">Tip zapisa</label>
                <select
                  id="log-type"
                  value={tip}
                  onChange={(e) => setTip(e.target.value as ShiftLogType)}
                  className="ht-input"
                >
                  {SHIFT_LOG_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="log-text" className="ht-field-label">Tekst</label>
                <textarea
                  id="log-text"
                  value={tekst}
                  onChange={(e) => setTekst(e.target.value)}
                  required
                  rows={4}
                  placeholder="Opišite zapažanje, primedbu ili informaciju..."
                  className="ht-input resize-y"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="submit" className="ht-btn-primary flex-1">Sačuvaj zapis</button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="ht-btn-secondary flex-1"
                >
                  Otkaži
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {isUpravnik && (
        <p className="flex items-center gap-2 text-base text-ht-muted">
          <AppIcon name="clipboard" className="h-4 w-4" />
          Dnevnik dežurne službe — zapažanja i primedbe sa smene
        </p>
      )}

      {logs.length === 0 ? (
        <EmptyState
          icon="clipboard"
          title="Nema zapisa smene"
          description={
            isDezurni
              ? "Unesite zapažanja i primedbe tokom dežurstva."
              : "Dežurna služba još nije unela zapise."
          }
        />
      ) : (
        logs.map((log) => (
          <article key={log.id} className="ht-panel-bordered p-5 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="ht-badge-gold">{shiftLogTypeLabel(log.tip)}</span>
              <time className="text-sm text-ht-muted" dateTime={log.createdAt}>
                {formatDate(log.createdAt)}
              </time>
            </div>
            <p className="text-base leading-relaxed text-ht-text">{log.tekst}</p>
            <p className="mt-3 text-sm text-ht-muted">{log.authorName}</p>
          </article>
        ))
      )}
    </div>
  );
}
