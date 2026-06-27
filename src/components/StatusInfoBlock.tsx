"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DAILY_INFO } from "@/lib/constants";
import { AppIcon } from "@/lib/icons";
import { getNotices } from "@/lib/storage";
import type { Notice } from "@/lib/types";
import { UrgentBadge } from "./StatusBadge";

export default function StatusInfoBlock() {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    setNotices(getNotices().filter((n) => n.aktivno));
  }, []);

  const latestUrgent = notices.find((n) => n.prioritet === "hitno");
  const activeCount = notices.length;

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("sr-Latn-RS", {
      day: "numeric",
      month: "long",
    });
  }

  return (
    <section className="grid gap-4 md:grid-cols-2" aria-label="Aktuelne informacije">
      {latestUrgent ? (
        <Link
          href="/obavestenja"
          className="ht-panel-bordered border-l-[3px] border-l-ht-danger p-6 transition-colors hover:bg-ht-cream/30 sm:p-7"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <UrgentBadge />
            <time className="text-sm text-ht-muted" dateTime={latestUrgent.datum}>
              {formatDate(latestUrgent.datum)}
            </time>
          </div>
          <h2 className="ht-display text-xl text-ht-navy">{latestUrgent.naslov}</h2>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ht-muted sm:text-base">
            {latestUrgent.tekst}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ht-navy">
            <AppIcon name="bell" className="h-3.5 w-3.5" />
            Sva obaveštenja ({activeCount}) →
          </span>
        </Link>
      ) : (
        <Link
          href="/obavestenja"
          className="ht-panel-bordered p-6 transition-colors hover:bg-ht-cream/30 sm:p-7"
        >
          <p className="ht-label mb-2 flex items-center gap-2">
            <AppIcon name="bell" className="h-3.5 w-3.5" />
            Obaveštenja
          </p>
          <p className="text-base text-ht-navy">
            {activeCount > 0
              ? `${activeCount} aktivnih obaveštenja — pogledajte listu`
              : "Nema hitnih obaveštenja"}
          </p>
        </Link>
      )}

      <div className={`ht-panel-bordered p-6 sm:p-7 ${!latestUrgent ? "" : ""}`}>
        <p className="ht-label mb-3 flex items-center gap-2">
          <AppIcon name="clock" className="h-3.5 w-3.5" />
          Dežurna služba
        </p>
        <p className="text-base leading-relaxed text-ht-text">{DAILY_INFO}</p>
      </div>
    </section>
  );
}
