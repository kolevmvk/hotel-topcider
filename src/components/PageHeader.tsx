import type { IconName } from "@/lib/icons";
import { AppIcon } from "@/lib/icons";

interface PageHeaderProps {
  title: string;
  description?: string;
  label?: string;
  icon?: IconName;
}

export default function PageHeader({ title, description, label, icon }: PageHeaderProps) {
  return (
    <header className="ht-page-header">
      {label && <p className="ht-label mb-3">{label}</p>}
      <div className="flex items-start gap-4">
        {icon && (
          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center border border-ht-border-light bg-ht-cream/50 text-ht-navy">
            <AppIcon name={icon} className="h-6 w-6" />
          </div>
        )}
        <div>
          <h1 className="ht-display text-3xl text-ht-navy sm:text-4xl">{title}</h1>
          {description && (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-ht-muted sm:text-lg">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="ht-gold-rule mt-6" />
    </header>
  );
}
