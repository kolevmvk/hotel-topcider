import type { Notice } from "@/lib/types";
import { getNoticeCategoryLabel } from "@/lib/mockNotices";
import { AppIcon } from "@/lib/icons";
import { UrgentBadge } from "./StatusBadge";

interface NoticeCardProps {
  notice: Notice;
  showArchiveBadge?: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function categoryIcon(kategorija: Notice["kategorija"]) {
  const map: Record<Notice["kategorija"], "alert" | "utensils" | "wrench" | "shield" | "info"> = {
    opste: "info",
    restoran: "utensils",
    odrzavanje: "wrench",
    bezbednost: "shield",
    dogadjaj: "info",
  };
  return map[kategorija];
}

export default function NoticeCard({ notice, showArchiveBadge = false }: NoticeCardProps) {
  const isUrgent = notice.prioritet === "hitno";

  return (
    <article
      className={`ht-panel-bordered p-6 sm:p-7 ${
        isUrgent ? "border-l-[3px] border-l-ht-danger" : ""
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center border border-ht-border-light bg-ht-cream/50 text-ht-navy">
            <AppIcon name={categoryIcon(notice.kategorija)} className="h-4 w-4" />
          </div>
          {isUrgent && <UrgentBadge />}
          <span className="ht-badge-gold">{getNoticeCategoryLabel(notice.kategorija)}</span>
          {showArchiveBadge && !notice.aktivno && (
            <span className="ht-badge bg-ht-cream text-ht-muted ring-1 ring-ht-border">
              Arhiva
            </span>
          )}
        </div>
        <time className="text-sm text-ht-muted" dateTime={notice.datum}>
          {formatDate(notice.datum)}
        </time>
      </div>

      <h3 className="ht-display text-xl text-ht-navy">{notice.naslov}</h3>
      <p className="mt-3 text-base leading-relaxed text-ht-text">{notice.tekst}</p>
    </article>
  );
}
