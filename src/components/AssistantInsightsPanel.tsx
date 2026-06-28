"use client";

import { useCallback, useEffect, useState } from "react";
import type { AssistantSessionDetail } from "@/lib/assistant/types";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("sr-Latn-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function insightSummary(session: AssistantSessionDetail): string {
  const priority = session.insights.find((i) => i.insightType === "priority")?.value;
  const sentiment = session.insights.find((i) => i.insightType === "sentiment")?.value;
  const useful = session.insights.find((i) => i.insightType === "usefulness")?.value;
  const parts = [priority, sentiment, useful].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export default function AssistantInsightsPanel() {
  const [sessions, setSessions] = useState<AssistantSessionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/assistant/insights?limit=200");
      if (res.ok) {
        const data = (await res.json()) as { sessions: AssistantSessionDetail[] };
        setSessions(data.sessions ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = sessions.find((s) => s.id === selectedId) ?? null;

  function exportCsv() {
    const rows = sessions.map((s) => [
      s.startedAt,
      s.organization,
      s.audience,
      s.accessUsername,
      s.messageCount,
      insightSummary(s),
    ]);
    const csv = [
      ["Vreme", "Organizacija", "Audience", "Username", "Poruka", "Uvidi"].join(","),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asistent-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading && sessions.length === 0) {
    return <p className="text-sm text-ht-muted">Učitavanje razgovora…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ht-muted">
          Razgovori asistenta po komandi / access nalogu.
        </p>
        <button
          type="button"
          onClick={exportCsv}
          disabled={sessions.length === 0}
          className="ht-btn-secondary text-sm"
        >
          Export CSV
        </button>
      </div>

      {sessions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ht-border p-6 text-center text-sm text-ht-muted">
          Nema sačuvanih razgovora.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-x-auto ht-panel-bordered max-h-[480px] overflow-y-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="sticky top-0 bg-ht-bg text-ht-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Vreme</th>
                  <th className="px-3 py-2 font-medium">Organizacija</th>
                  <th className="px-3 py-2 font-medium">Poruke</th>
                  <th className="px-3 py-2 font-medium">Uvidi</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`cursor-pointer border-t border-ht-border hover:bg-ht-cream/30 ${
                      selectedId === s.id ? "bg-ht-cream/50" : ""
                    }`}
                  >
                    <td className="whitespace-nowrap px-3 py-2">{formatTime(s.startedAt)}</td>
                    <td className="px-3 py-2">
                      <span className="font-medium text-ht-navy">{s.organization}</span>
                      <span className="block text-xs text-ht-muted">{s.audience}</span>
                    </td>
                    <td className="px-3 py-2">{s.messageCount}</td>
                    <td className="px-3 py-2 text-xs text-ht-muted">{insightSummary(s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ht-panel-bordered p-4 max-h-[480px] overflow-y-auto">
            {!selected ? (
              <p className="text-sm text-ht-muted">Izaberite sesiju za detalje.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-ht-navy">{selected.organization}</p>
                  <p className="text-xs text-ht-muted">
                    {selected.accessUsername} · {formatTime(selected.startedAt)}
                  </p>
                </div>
                {selected.insights.length > 0 && (
                  <div>
                    <p className="ht-label mb-2">Uvidi</p>
                    <ul className="space-y-1 text-sm text-ht-muted">
                      {selected.insights.map((i) => (
                        <li key={i.id}>
                          <span className="font-medium text-ht-navy">{i.insightType}:</span>{" "}
                          {i.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <p className="ht-label mb-2">Razgovor</p>
                  <div className="space-y-2">
                    {selected.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`text-sm px-2 py-1.5 ${
                          m.role === "user"
                            ? "bg-ht-navy/10 text-ht-navy"
                            : "bg-ht-cream/50 text-ht-text"
                        }`}
                      >
                        <span className="text-xs font-semibold uppercase text-ht-muted">
                          {m.role === "user" ? "Posetilac" : "Asistent"}
                        </span>
                        <p className="mt-0.5 whitespace-pre-wrap">{m.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
