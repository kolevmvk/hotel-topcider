import type { IconName } from "@/lib/icons";
import { AppIcon } from "@/lib/icons";

interface ContactCardProps {
  title: string;
  phone: string;
  displayPhone: string;
  description: string;
  icon?: IconName;
}

export default function ContactCard({
  title,
  phone,
  displayPhone,
  description,
  icon = "phone",
}: ContactCardProps) {
  const telHref = title === "Hitni brojevi" ? undefined : `tel:${phone}`;

  return (
    <article className="ht-panel-bordered ht-card-hover p-6 sm:p-7">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-ht-border-light bg-ht-cream/50 text-ht-navy">
          <AppIcon name={icon} className="h-4 w-4" />
        </div>
        <div>
          <p className="ht-label mb-1">Kontakt</p>
          <h3 className="ht-display text-xl text-ht-navy">{title}</h3>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-ht-muted sm:text-base">{description}</p>
      <div className="mt-5 border-t border-ht-border-light pt-4">
        {telHref ? (
          <a
            href={telHref}
            className="touch-target inline-flex items-center gap-2.5 text-lg font-medium text-ht-navy transition-colors hover:text-ht-gold"
          >
            <AppIcon name="phone" className="h-4 w-4 text-ht-gold" />
            {displayPhone}
          </a>
        ) : (
          <p className="inline-flex items-center gap-2 text-base font-medium text-ht-text">
            <AppIcon name="alert" className="h-4 w-4 text-ht-danger" />
            {displayPhone}
          </p>
        )}
      </div>
    </article>
  );
}
