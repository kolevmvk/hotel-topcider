import Link from "next/link";
import { HOTEL_SERVICES } from "@/lib/constants";
import { AppIcon } from "@/lib/icons";
import type { IconName } from "@/lib/icons";

const SERVICE_ICONS: Record<string, IconName> = {
  building: "building",
  clock: "clock",
  wrench: "wrench",
  info: "info",
};

export default function HotelServiceBlock() {
  return (
    <section aria-label="Hotel servis">
      <div className="mb-6">
        <p className="ht-label mb-2">Organizacija</p>
        <h2 className="ht-display text-2xl text-ht-navy sm:text-3xl">Službe hotela</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {HOTEL_SERVICES.map((service) => (
          <Link
            key={service.id}
            href={service.href}
            className="ht-panel-bordered ht-card-hover group flex items-center gap-4 p-5 sm:p-6"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center border border-ht-border-light bg-ht-cream/30 text-ht-navy transition-colors group-hover:bg-ht-navy group-hover:text-ht-gold-light"
              aria-hidden="true"
            >
              <AppIcon name={SERVICE_ICONS[service.icon]} className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="ht-display text-lg text-ht-navy">{service.title}</h3>
              <p className="mt-0.5 text-sm text-ht-muted">{service.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
