"use client";

import { useState } from "react";
import { PROBLEM_CATEGORIES } from "@/lib/constants";
import { AppIcon } from "@/lib/icons";
import type { ProblemReport } from "@/lib/types";
import StatusBadge, { ConfirmationBadge } from "./StatusBadge";

interface ProblemCardProps {
  problem: ProblemReport;
  showUser?: boolean;
  onStatusChange?: (id: string, status: ProblemReport["status"]) => void;
  onDezurniConfirm?: (
    id: string,
    preduzeteMere: boolean,
    napomena?: string
  ) => void;
  canConfirmMeasures?: boolean;
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

function getCategoryLabel(category: ProblemReport["category"]): string {
  return PROBLEM_CATEGORIES.find((c) => c.value === category)?.label || category;
}

export default function ProblemCard({
  problem,
  showUser = false,
  onStatusChange,
  onDezurniConfirm,
  canConfirmMeasures = false,
}: ProblemCardProps) {
  const [napomena, setNapomena] = useState("");
  const [confirming, setConfirming] = useState(false);

  function handleConfirm(preduzeteMere: boolean) {
    if (!onDezurniConfirm) return;
    setConfirming(true);
    onDezurniConfirm(problem.id, preduzeteMere, napomena.trim() || undefined);
    setConfirming(false);
    setNapomena("");
  }

  return (
    <article className="ht-panel-bordered p-6 sm:p-7">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-ht-border-light bg-ht-cream/50 text-ht-navy">
            <AppIcon name="wrench" className="h-4 w-4" />
          </div>
          <div>
            <h3 className="ht-display text-xl text-ht-navy">
              {getCategoryLabel(problem.category)}
            </h3>
            {showUser && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ht-muted">
                <AppIcon name="users" className="h-3.5 w-3.5" />
                {problem.fullName} · Soba {problem.room}
              </p>
            )}
          </div>
        </div>
        <StatusBadge status={problem.status} />
      </div>

      <p className="text-base leading-relaxed text-ht-text">{problem.description}</p>

      {problem.dezurniPotvrda && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ht-border-light pt-4">
          <ConfirmationBadge preduzeteMere={problem.dezurniPotvrda.preduzeteMere} />
          <span className="text-sm text-ht-muted">
            {problem.dezurniPotvrda.confirmedBy} ·{" "}
            {formatDate(problem.dezurniPotvrda.confirmedAt)}
          </span>
          {problem.dezurniPotvrda.napomena && (
            <p className="w-full text-sm text-ht-muted">
              Napomena: {problem.dezurniPotvrda.napomena}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ht-border-light pt-4 text-sm text-ht-muted">
        <time dateTime={problem.createdAt}>{formatDate(problem.createdAt)}</time>
        {problem.phone && (
          <span className="inline-flex items-center gap-1.5">
            <AppIcon name="phone" className="h-3.5 w-3.5" />
            {problem.phone}
          </span>
        )}
      </div>

      {canConfirmMeasures && !problem.dezurniPotvrda && onDezurniConfirm && (
        <div className="mt-5 border-t border-ht-border-light pt-5">
          <p className="ht-field-label mb-3">Potvrda preduzetih mera</p>
          <textarea
            value={napomena}
            onChange={(e) => setNapomena(e.target.value)}
            rows={2}
            placeholder="Kratka napomena (opciono)..."
            className="ht-input mb-4 resize-y"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={confirming}
              onClick={() => handleConfirm(true)}
              className="ht-btn-primary touch-target flex-1"
            >
              Mere preduzete
            </button>
            <button
              type="button"
              disabled={confirming}
              onClick={() => handleConfirm(false)}
              className="ht-btn-secondary touch-target flex-1"
            >
              Mere nisu preduzete
            </button>
          </div>
        </div>
      )}

      {onStatusChange && (
        <div className="mt-5 border-t border-ht-border-light pt-5">
          <label htmlFor={`status-${problem.id}`} className="ht-field-label">
            Promena statusa
          </label>
          <select
            id={`status-${problem.id}`}
            value={problem.status}
            onChange={(e) =>
              onStatusChange(problem.id, e.target.value as ProblemReport["status"])
            }
            className="ht-input"
          >
            <option value="Primljeno">Primljeno</option>
            <option value="U radu">U radu</option>
            <option value="Rešeno">Rešeno</option>
          </select>
        </div>
      )}
    </article>
  );
}
