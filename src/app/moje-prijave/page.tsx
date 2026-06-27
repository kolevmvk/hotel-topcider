"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProblemCard from "@/components/ProblemCard";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/components/AuthProvider";
import {
  getProblems,
  getProblemsByUserId,
  updateDezurniPotvrda,
} from "@/lib/storage";
import { upravaTabHref } from "@/lib/navigation";
import type { ProblemReport } from "@/lib/types";

type StatusFilter = "all" | ProblemReport["status"];

export default function MojePrijavePage() {
  const { session, isStaff, isUpravnik, isDezurni } = useAuth();
  const [problems, setProblems] = useState<ProblemReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const refresh = useCallback(() => {
    if (isStaff) {
      setProblems(getProblems());
    } else if (session?.userId) {
      setProblems(getProblemsByUserId(session.userId));
    }
  }, [session, isStaff]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return problems;
    return problems.filter((p) => p.status === statusFilter);
  }, [problems, statusFilter]);

  function handleDezurniConfirm(
    id: string,
    preduzeteMere: boolean,
    napomena?: string
  ) {
    updateDezurniPotvrda(id, {
      preduzeteMere,
      napomena,
      confirmedAt: new Date().toISOString(),
      confirmedBy: session?.fullName || "Dežurna služba",
    });
    refresh();
  }

  const title = isUpravnik
    ? "Prijave stanara"
    : isDezurni
      ? "Prijave stanara"
      : "Moje prijave";

  const description = isUpravnik
    ? "Pregled prijava — za upravljanje koristite panel upravnika"
    : isDezurni
      ? "Pregled prijava i potvrda preduzetih mera na licu mesta"
      : "Pregled poslatih prijava i njihovog statusa";

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl">
        <PageHeader label="Praćenje" title={title} description={description} icon="list" />

        {isUpravnik && (
          <div className="mb-6 ht-panel-bordered p-4">
            <p className="text-sm text-ht-muted">
              Ovo je pregled za brzu orientaciju. Promenu statusa i rešavanje vršite u panelu.
            </p>
            <Link href={upravaTabHref("problems")} className="ht-btn-primary mt-3 inline-flex text-sm">
              Upravljaj u panelu
            </Link>
          </div>
        )}

        {isDezurni && (
          <div className="mb-6">
            <Link href="/uprava" className="ht-btn-secondary inline-flex items-center gap-2 text-sm">
              Dežurna evidencija
            </Link>
          </div>
        )}

        {!isStaff && problems.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {(
              [
                ["all", "Sve"],
                ["Primljeno", "Primljeno"],
                ["U radu", "U radu"],
                ["Rešeno", "Rešeno"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`ht-filter-chip ${statusFilter === value ? "ht-filter-chip-active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            icon="clipboard"
            title="Nema evidentiranih prijava"
            description={
              isStaff
                ? "Kada stanari pošalju prijave, one će se pojaviti ovde."
                : "Još niste poslali nijednu prijavu. Možete prijaviti problem putem forme."
            }
            action={
              !isStaff ? (
                <Link href="/prijava" className="ht-btn-primary inline-flex">
                  Prijavi problem
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                showUser={isStaff}
                onDezurniConfirm={isDezurni ? handleDezurniConfirm : undefined}
                canConfirmMeasures={isDezurni}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
