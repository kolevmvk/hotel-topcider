"use client";

import { useEffect, useState } from "react";
import type { AuditLogEntry } from "@/lib/audit/types";
import { STORAGE_KEYS } from "@/lib/constants";
import { Shield, LogIn, RefreshCw } from "lucide-react";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function loginTypeLabel(type?: string): string {
  switch (type) {
    case "stanar":
      return "Stanar";
    case "dezurni":
      return "Dežurni";
    case "upravnik":
      return "Upravnik";
    case "gost":
      return "Gost";
    default:
      return "—";
  }
}

function readCachedLogs(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuditLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function cacheLogs(logs: AuditLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 500)));
  } catch {
    /* quota */
  }
}

export default function AccessAuditPanel() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "access_login" | "app_login" | "failures">("all");

  function exportCsv() {
    const rows = filtered.map((entry) => [
      entry.timestamp,
      entry.type,
      entry.type === "access_login" ? entry.username ?? "" : entry.identifier ?? "",
      entry.success ? "Uspeh" : "Neuspeh",
      entry.ipAddress ?? "",
    ]);
    const csv = [
      ["Vreme", "Tip", "Identifikator", "Status", "IP"].join(","),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/audit?limit=200");
      if (res.ok) {
        const data = (await res.json()) as { logs: AuditLogEntry[] };
        const next = data.logs ?? [];
        setLogs(next);
        cacheLogs(next);
      } else {
        setLogs(readCachedLogs());
      }
    } catch {
      setLogs(readCachedLogs());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered =
    filter === "all"
      ? logs
      : filter === "failures"
        ? logs.filter((l) => !l.success)
        : logs.filter((l) => l.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ht-navy">Evidencija pristupa</h2>
          <p className="text-sm text-ht-muted">
            Pokušaji pristupa aplikaciji i prijave po ulogama (bez PIN-a i lozinki).
          </p>
        </div>
        <button
          type="button"
          onClick={loadLogs}
          disabled={loading}
          className="ht-btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Osveži
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="ht-btn-secondary text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Sve"],
            ["access_login", "Pristup aplikaciji"],
            ["app_login", "App prijava"],
            ["failures", "Neuspeh"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`ht-filter-chip ${filter === value ? "ht-filter-chip-active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && logs.length === 0 ? (
        <p className="text-sm text-ht-muted">Učitavanje…</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ht-border p-6 text-center text-sm text-ht-muted">
          Nema evidentiranih pokušaja.
        </p>
      ) : (
        <div className="overflow-x-auto ht-panel-bordered">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-ht-bg text-ht-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Vreme</th>
                <th className="px-3 py-2 font-medium">Tip</th>
                <th className="px-3 py-2 font-medium">Identifikator</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-t border-ht-border hover:bg-ht-cream/30"
                >
                  <td className="whitespace-nowrap px-3 py-2 text-ht-navy">
                    {formatTime(entry.timestamp)}
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1.5">
                      {entry.type === "access_login" ? (
                        <Shield className="h-3.5 w-3.5 text-ht-gold" />
                      ) : (
                        <LogIn className="h-3.5 w-3.5 text-ht-navy" />
                      )}
                      {entry.type === "access_login"
                        ? "Pristup"
                        : loginTypeLabel(entry.loginType)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-ht-navy">
                    {entry.type === "access_login"
                      ? entry.username
                      : entry.identifier}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        entry.success
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {entry.success ? "Uspeh" : "Neuspeh"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-ht-muted">{entry.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
