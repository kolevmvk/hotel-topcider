"use client";

import { useState } from "react";
import { AppIcon } from "@/lib/icons";
import type { HotelTask } from "@/lib/types";

interface TaskCardProps {
  task: HotelTask;
  isUpravnik?: boolean;
  isDezurni?: boolean;
  onStatusChange?: (id: string, status: HotelTask["status"]) => void;
  onAddObservation?: (id: string, tekst: string) => void;
  onConfirmExecution?: (id: string, izvrseno: boolean, napomena?: string) => void;
  onApprove?: (id: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status: HotelTask["status"]): string {
  switch (status) {
    case "Dodeljen":
      return "bg-ht-cream text-ht-navy ring-1 ring-ht-border";
    case "U radu":
      return "bg-amber-50 text-amber-900 ring-1 ring-amber-200/70";
    case "Izvršen":
      return "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70";
    case "Potvrđen":
      return "bg-ht-navy/5 text-ht-navy ring-1 ring-ht-navy/20";
    default:
      return "bg-ht-cream text-ht-muted";
  }
}

export default function TaskCard({
  task,
  isUpravnik,
  isDezurni,
  onStatusChange,
  onAddObservation,
  onConfirmExecution,
  onApprove,
}: TaskCardProps) {
  const [obsText, setObsText] = useState("");
  const [execNote, setExecNote] = useState("");
  const [showObsForm, setShowObsForm] = useState(false);

  return (
    <article
      className={`ht-panel-bordered p-6 sm:p-7 ${
        task.prioritet === "hitno" ? "border-l-[3px] border-l-ht-danger" : ""
      }`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-ht-border-light bg-ht-cream/50 text-ht-navy">
            <AppIcon name="task" className="h-4 w-4" />
          </div>
          <div>
            <h3 className="ht-display text-xl text-ht-navy">{task.naslov}</h3>
            <p className="mt-1 text-sm text-ht-muted">
              Od: {task.createdByName} · {formatDate(task.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {task.prioritet === "hitno" && (
            <span className="ht-badge-urgent">Hitno</span>
          )}
          <span className={`ht-badge ${statusClass(task.status)}`}>{task.status}</span>
        </div>
      </div>

      <p className="text-base leading-relaxed text-ht-text">{task.opis}</p>

      {task.rok && (
        <p className="mt-3 text-sm text-ht-muted">
          Rok: {formatDate(task.rok)}
        </p>
      )}

      {task.zapazanja.length > 0 && (
        <div className="mt-5 border-t border-ht-border-light pt-4">
          <p className="ht-field-label mb-3">Zapažanja dežurne službe</p>
          <ul className="space-y-3">
            {task.zapazanja.map((z) => (
              <li key={z.id} className="border-l-2 border-ht-gold/50 pl-3">
                <p className="text-sm leading-relaxed text-ht-text">{z.tekst}</p>
                <p className="mt-1 text-xs text-ht-muted">
                  {z.authorName} · {formatDate(z.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {task.izvrsenje && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ht-border-light pt-4">
          <span
            className={`ht-badge ${
              task.izvrsenje.izvrseno
                ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70"
                : "bg-ht-danger-bg text-ht-danger ring-1 ring-ht-danger/20"
            }`}
          >
            {task.izvrsenje.izvrseno ? "Izvršeno" : "Nije izvršeno"}
          </span>
          <span className="text-sm text-ht-muted">
            {task.izvrsenje.confirmedBy} · {formatDate(task.izvrsenje.confirmedAt)}
          </span>
          {task.izvrsenje.napomena && (
            <p className="w-full text-sm text-ht-muted">{task.izvrsenje.napomena}</p>
          )}
        </div>
      )}

      {isDezurni && task.status !== "Potvrđen" && !task.izvrsenje && (
        <div className="mt-5 space-y-4 border-t border-ht-border-light pt-5">
          {onStatusChange && task.status === "Dodeljen" && (
            <button
              type="button"
              onClick={() => onStatusChange(task.id, "U radu")}
              className="ht-btn-secondary w-full sm:w-auto"
            >
              Preuzmi zadatak
            </button>
          )}

          {onAddObservation && (
            <div>
              {!showObsForm ? (
                <button
                  type="button"
                  onClick={() => setShowObsForm(true)}
                  className="text-sm font-medium text-ht-navy underline underline-offset-2"
                >
                  + Dodaj zapažanje
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={obsText}
                    onChange={(e) => setObsText(e.target.value)}
                    rows={2}
                    placeholder="Zapažanje ili primedba..."
                    className="ht-input resize-y"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!obsText.trim()}
                      onClick={() => {
                        onAddObservation(task.id, obsText.trim());
                        setObsText("");
                        setShowObsForm(false);
                      }}
                      className="ht-btn-primary"
                    >
                      Sačuvaj
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowObsForm(false)}
                      className="ht-btn-secondary"
                    >
                      Otkaži
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {onConfirmExecution && (task.status === "U radu" || task.zapazanja.length > 0) && (
            <div>
              <p className="ht-field-label mb-2">Potvrda izvršenja</p>
              <textarea
                value={execNote}
                onChange={(e) => setExecNote(e.target.value)}
                rows={2}
                placeholder="Napomena (opciono)..."
                className="ht-input mb-3 resize-y"
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => onConfirmExecution(task.id, true, execNote.trim() || undefined)}
                  className="ht-btn-primary flex-1"
                >
                  Potvrdi izvršenje
                </button>
                <button
                  type="button"
                  onClick={() => onConfirmExecution(task.id, false, execNote.trim() || undefined)}
                  className="ht-btn-secondary flex-1"
                >
                  Nije izvršeno
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isUpravnik && task.status === "Izvršen" && onApprove && (
        <div className="mt-5 border-t border-ht-border-light pt-5">
          <button type="button" onClick={() => onApprove(task.id)} className="ht-btn-primary">
            Potvrdi zadatak (pregled upravnika)
          </button>
        </div>
      )}
    </article>
  );
}
