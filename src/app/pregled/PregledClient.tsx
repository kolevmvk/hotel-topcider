"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { APP_NAME, STORAGE_KEYS } from "@/lib/constants";
import {
  getManagerDashboardCounts,
  getResolvedProblemsLast7Days,
  getRoomOccupancyCounts,
} from "@/lib/dashboard";
import { getProblems, getUsers } from "@/lib/storage";
import type { AuditLogEntry } from "@/lib/audit/types";
import { AppIcon } from "@/lib/icons";

function readAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuditLogEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch {
    return [];
  }
}

export default function PregledPage() {
  const [generatedAt, setGeneratedAt] = useState("");
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    setGeneratedAt(
      new Date().toLocaleString("sr-Latn-RS", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    setAuditLogs(readAuditLogs());
    fetch("/api/audit?limit=10")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.logs) setAuditLogs(data.logs.slice(0, 10));
      })
      .catch(() => {});
  }, []);

  const rooms = getRoomOccupancyCounts();
  const stats = getManagerDashboardCounts();
  const resolved7d = getResolvedProblemsLast7Days();
  const activeGuests = getUsers().filter((u) => u.role === "gost" && u.status === "active").length;
  const openProblems = getProblems().filter((p) => p.status !== "Rešeno").length;
  const maxBar = Math.max(rooms.zauzeta, rooms.slobodna, rooms.renoviranje, 1);

  return (
    <div className="pregled-report mx-auto max-w-4xl space-y-8 print:space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ht-border pb-6 print:border-black">
        <div>
          <p className="ht-label">Operativni izveštaj</p>
          <h1 className="ht-display text-3xl text-ht-navy print:text-2xl">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-ht-muted">Generisano: {generatedAt || "—"}</p>
        </div>
        <div className="no-print flex gap-2">
          <button type="button" onClick={() => window.print()} className="ht-btn-secondary text-sm">
            Štampaj
          </button>
          <Link href="/login" className="ht-btn-primary text-sm">
            Prijava u aplikaciju
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Zauzete sobe", value: rooms.zauzeta },
          { label: "Slobodne sobe", value: rooms.slobodna },
          { label: "Renoviranje", value: rooms.renoviranje },
          { label: "Otvorene prijave", value: openProblems },
          { label: "Rešeno (7 dana)", value: resolved7d },
          { label: "Aktivni gosti", value: activeGuests },
          { label: "Na odobrenju", value: stats.pendingUsers },
          { label: "Ukupno soba", value: rooms.total },
        ].map((item) => (
          <div key={item.label} className="ht-panel-bordered p-5 print:border print:border-gray-300">
            <p className="text-sm text-ht-muted">{item.label}</p>
            <p className="ht-display mt-1 text-4xl text-ht-navy">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="ht-panel-bordered p-6 print:border print:border-gray-300">
        <h2 className="mb-4 text-lg font-semibold text-ht-navy">Zauzetost soba</h2>
        <div className="space-y-3">
          {[
            { label: "Zauzete", value: rooms.zauzeta, color: "bg-ht-navy" },
            { label: "Slobodne", value: rooms.slobodna, color: "bg-emerald-600" },
            { label: "Renoviranje", value: rooms.renoviranje, color: "bg-amber-500" },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{bar.label}</span>
                <span className="font-semibold">{bar.value}</span>
              </div>
              <div className="h-4 bg-ht-cream">
                <div
                  className={`h-full ${bar.color}`}
                  style={{ width: `${(bar.value / maxBar) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ht-panel-bordered p-6 print:border print:border-gray-300">
        <h2 className="mb-4 text-lg font-semibold text-ht-navy">Poslednji audit događaji</h2>
        {auditLogs.length === 0 ? (
          <p className="text-sm text-ht-muted">Nema evidentiranih događaja u kešu.</p>
        ) : (
          <ul className="divide-y divide-ht-border text-sm">
            {auditLogs.map((entry) => (
              <li key={entry.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span>
                  {entry.type === "access_login" ? "Pristup aplikaciji" : "App prijava"} —{" "}
                  {entry.type === "access_login" ? entry.username : entry.identifier}
                </span>
                <span className={entry.success ? "text-emerald-700" : "text-red-700"}>
                  {entry.success ? "Uspeh" : "Neuspeh"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="ht-panel-bordered border-l-[3px] border-l-ht-gold p-6 print:border print:border-gray-300">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-ht-navy">
          <AppIcon name="shield" className="h-5 w-5" />
          Bezbednost
        </h2>
        <ul className="space-y-2 text-sm text-ht-muted">
          <li>Zaštićen ulaz u sistem — samo ovlašćena lica</li>
          <li>Evidencija pokušaja pristupa bez osetljivih podataka</li>
          <li>Uloge i ovlašćenja odvojeni po funkciji (stanar, gost, osoblje)</li>
        </ul>
      </section>

      <p className="no-print text-center text-sm text-ht-muted">
        <Link href="/login" className="font-semibold text-ht-navy underline underline-offset-2">
          Uđi u operativni sistem hotela
        </Link>
      </p>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .pregled-report {
            padding: 0;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
