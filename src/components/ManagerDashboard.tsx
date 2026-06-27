"use client";

import Link from "next/link";
import { getManagerDashboardCounts } from "@/lib/dashboard";
import { upravaTabHref } from "@/lib/navigation";
import { AppIcon, ChevronRight } from "@/lib/icons";

function StatLink({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: number;
  href: string;
  icon: "clipboard" | "users" | "bed" | "wrench";
}) {
  if (value === 0) return null;
  return (
    <Link
      href={href}
      className="ht-panel-bordered flex items-center gap-4 p-4 transition-colors hover:bg-ht-cream/30 sm:p-5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-ht-border-light bg-ht-cream/40 text-ht-navy">
        <AppIcon name={icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ht-muted">{label}</p>
        <p className="ht-display text-2xl text-ht-navy">{value}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-ht-gold" strokeWidth={1.75} />
    </Link>
  );
}

export default function ManagerDashboard() {
  const stats = getManagerDashboardCounts();

  return (
    <section className="space-y-4" aria-label="Command center">
      <div>
        <p className="ht-label mb-1">Command center</p>
        <h2 className="ht-display text-2xl text-ht-navy sm:text-3xl">Operativni pregled</h2>
        <p className="mt-1 text-sm text-ht-muted">Kliknite na stavku za direktan pristup u panelu</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatLink
          label="Otvorene prijave"
          value={stats.openProblems}
          href={upravaTabHref("problems")}
          icon="clipboard"
        />
        <StatLink
          label="Na odobrenju"
          value={stats.pendingUsers}
          href={upravaTabHref("people")}
          icon="users"
        />
        <StatLink
          label="Aktivni gosti"
          value={stats.activeGuests}
          href="/sobe"
          icon="bed"
        />
        <StatLink
          label="Sobe — renoviranje"
          value={stats.renovationRooms}
          href="/sobe"
          icon="wrench"
        />
      </div>
      <Link href={upravaTabHref("pregled")} className="ht-btn-primary inline-flex items-center gap-2">
        <AppIcon name="shield" className="h-4 w-4" />
        Otvori panel upravnika
      </Link>
    </section>
  );
}
