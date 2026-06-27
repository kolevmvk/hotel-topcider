"use client";

import Link from "next/link";
import { getShiftInboxCounts } from "@/lib/dashboard";
import { upravaTabHref } from "@/lib/navigation";
import { getPendingDezurniHandovers } from "@/lib/rooms";
import { getProblems, getTasks } from "@/lib/storage";
import { AppIcon, ChevronRight } from "@/lib/icons";

function minutesAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "upravo sada";
  if (min < 60) return `pre ${min} min`;
  const h = Math.floor(min / 60);
  return `pre ${h}h`;
}

export default function ShiftInbox() {
  const counts = getShiftInboxCounts();
  const handovers = getPendingDezurniHandovers();
  const problems = getProblems().filter(
    (p) => p.status !== "Rešeno" && !p.dezurniPotvrda
  );
  const tasks = getTasks().filter((t) => t.status !== "Potvrđen");

  if (counts.total === 0) {
    return (
      <section className="ht-panel-bordered p-6 text-center">
        <AppIcon name="check" className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
        <p className="font-medium text-ht-navy">Smenski inbox je prazan</p>
        <p className="mt-1 text-sm text-ht-muted">Nema stavki koje čekaju vašu akciju.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-label="Smenski inbox">
      <div>
        <p className="ht-label mb-1">Smenski inbox</p>
        <h2 className="ht-display text-2xl text-ht-navy">
          {counts.total} {counts.total === 1 ? "stavka" : "stavki"} čeka akciju
        </h2>
      </div>

      <div className="space-y-3">
        {handovers.map((h) => (
          <Link
            key={h.id}
            href="/sobe"
            className="ht-panel-bordered flex items-center gap-4 border-l-[3px] border-l-ht-gold p-4 transition-colors hover:bg-ht-cream/30"
          >
            <AppIcon name="bed" className="h-5 w-5 shrink-0 text-ht-gold" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ht-navy">
                {h.tip === "prijem" ? "Prijem" : "Predaja"} sobe {h.brojSobe}
              </p>
              <p className="text-sm text-ht-muted">
                {h.userName} · {minutesAgo(h.createdAt)}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-ht-gold" strokeWidth={1.75} />
          </Link>
        ))}

        {problems.slice(0, 5).map((p) => (
          <Link
            key={p.id}
            href="/moje-prijave"
            className="ht-panel-bordered flex items-center gap-4 border-l-[3px] border-l-ht-navy/40 p-4 transition-colors hover:bg-ht-cream/30"
          >
            <AppIcon name="clipboard" className="h-5 w-5 shrink-0 text-ht-navy" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ht-navy">
                Prijava — soba {p.room}
              </p>
              <p className="truncate text-sm text-ht-muted">{p.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-ht-gold" strokeWidth={1.75} />
          </Link>
        ))}

        {tasks.slice(0, 3).map((t) => (
          <Link
            key={t.id}
            href={upravaTabHref("operativa")}
            className="ht-panel-bordered flex items-center gap-4 border-l-[3px] border-l-amber-500/60 p-4 transition-colors hover:bg-ht-cream/30"
          >
            <AppIcon name="task" className="h-5 w-5 shrink-0 text-amber-700" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ht-navy">{t.naslov}</p>
              <p className="text-sm text-ht-muted">Status: {t.status}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-ht-gold" strokeWidth={1.75} />
          </Link>
        ))}
      </div>
    </section>
  );
}
