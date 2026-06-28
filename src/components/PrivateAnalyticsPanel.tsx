"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AnalyticsEvent, AnalyticsSummary } from "@/lib/analytics/types";
import AssistantInsightsPanel from "@/components/AssistantInsightsPanel";
import { RefreshCw } from "lucide-react";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("sr-Latn-RS", {
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

function deviceLabel(type: string): string {
  switch (type) {
    case "mobile":
      return "Mobilni";
    case "tablet":
      return "Tablet";
    case "desktop":
      return "Računar";
    default:
      return "Nepoznato";
  }
}

function actorDisplay(e: AnalyticsEvent): string {
  const parts = [e.actorLabel, e.actorRole, e.room ? `Soba ${e.room}` : null].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Anonimno";
}

export default function PrivateAnalyticsPanel() {
  const [logs, setLogs] = useState<AnalyticsEvent[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "predlogin" | "security" | "navigation" | "interaction" | "business" | "failures" | "bots" | "assistant"
  >("predlogin");
  const [deviceFilter, setDeviceFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "300" });
      if (filter === "predlogin") {
        params.set("category", "security");
        params.set("eventName", "access.login");
      }
      if (filter === "security") params.set("category", "security");
      if (filter === "navigation") params.set("category", "navigation");
      if (filter === "interaction") params.set("category", "interaction");
      if (filter === "business") params.set("category", "business");
      if (filter === "failures") params.set("success", "false");
      if (filter === "bots") params.set("isBot", "true");
      if (deviceFilter !== "all") params.set("device", deviceFilter);

      const [listRes, summaryRes] = await Promise.all([
        fetch(`/api/analytics?${params}`),
        fetch("/api/analytics/summary"),
      ]);

      if (listRes.ok) {
        const data = (await listRes.json()) as { logs: AnalyticsEvent[] };
        setLogs(data.logs ?? []);
      }
      if (summaryRes.ok) {
        const data = (await summaryRes.json()) as { summary: AnalyticsSummary };
        setSummary(data.summary ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, [filter, deviceFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => logs, [logs]);

  function exportCsv() {
    const rows = filtered.map((e) => [
      e.timestamp,
      e.category,
      e.eventName,
      actorDisplay(e),
      e.path ?? "",
      e.targetId ?? "",
      deviceLabel(e.deviceType),
      e.isBot ? "Da" : "Ne",
      e.success === false ? "Neuspeh" : e.success === true ? "Uspeh" : "",
      e.ipAddress ?? "",
    ]);
    const csv = [
      ["Vreme", "Kategorija", "Događaj", "Ko", "Stranica", "Cilj", "Uređaj", "Bot", "Status", "IP"].join(","),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analitika-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="ht-display text-2xl text-ht-navy">Interna analitika</h1>
          <p className="text-sm text-ht-muted">Samo vlasnik pristupa — nije u meniju aplikacije.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="ht-btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Osveži
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="ht-btn-primary text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="ht-stat-card">
            <p className="ht-label">Posete (7 dana)</p>
            <p className="ht-display mt-1 text-3xl text-ht-navy">{summary.pageViews}</p>
          </div>
          <div className="ht-stat-card">
            <p className="ht-label">Mobilni</p>
            <p className="ht-display mt-1 text-3xl text-ht-navy">{summary.mobileCount}</p>
          </div>
          <div className="ht-stat-card">
            <p className="ht-label">Računar</p>
            <p className="ht-display mt-1 text-3xl text-ht-navy">{summary.desktopCount}</p>
          </div>
          <div className="ht-stat-card">
            <p className="ht-label">Bot / neuspeh</p>
            <p className="ht-display mt-1 text-3xl text-ht-navy">
              {summary.botAttempts} / {summary.failedSecurity}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["predlogin", "Pred-login (/access)"],
            ["all", "Sve"],
            ["navigation", "Stranice"],
            ["interaction", "Klikovi"],
            ["business", "Poslovno"],
            ["security", "Bezbednost"],
            ["failures", "Neuspeh"],
            ["bots", "Botovi"],
            ["assistant", "Asistent"],
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
        <select
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          className="ht-input text-sm"
          aria-label="Uređaj"
        >
          <option value="all">Svi uređaji</option>
          <option value="mobile">Mobilni</option>
          <option value="tablet">Tablet</option>
          <option value="desktop">Računar</option>
        </select>
      </div>

      {filter === "assistant" ? (
        <AssistantInsightsPanel />
      ) : loading && logs.length === 0 ? (
        <p className="text-sm text-ht-muted">Učitavanje…</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ht-border p-6 text-center text-sm text-ht-muted">
          Nema događaja.
        </p>
      ) : (
        <div className="overflow-x-auto ht-panel-bordered">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-ht-bg text-ht-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Vreme</th>
                <th className="px-3 py-2 font-medium">Ko</th>
                <th className="px-3 py-2 font-medium">Događaj</th>
                <th className="px-3 py-2 font-medium">Cilj</th>
                <th className="px-3 py-2 font-medium">Uređaj</th>
                <th className="px-3 py-2 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-t border-ht-border hover:bg-ht-cream/30">
                  <td className="whitespace-nowrap px-3 py-2">{formatTime(entry.timestamp)}</td>
                  <td className="px-3 py-2">{actorDisplay(entry)}</td>
                  <td className="px-3 py-2">
                    {entry.eventName}
                    {entry.isBot && (
                      <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[0.65rem] text-amber-900">
                        bot
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-ht-muted">
                    {entry.targetLabel || entry.targetId || entry.path || "—"}
                  </td>
                  <td className="px-3 py-2 text-ht-muted">{deviceLabel(entry.deviceType)}</td>
                  <td className="px-3 py-2 text-ht-muted">{entry.ipAddress ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
