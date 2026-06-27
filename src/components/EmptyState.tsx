import type { IconName } from "@/lib/icons";
import { AppIcon } from "@/lib/icons";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon = "info",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="ht-panel-bordered px-6 py-12 text-center sm:px-10 sm:py-14">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-ht-border-light bg-ht-cream/50 text-ht-navy">
        <AppIcon name={icon} className="h-7 w-7" />
      </div>
      <p className="ht-display text-xl text-ht-navy sm:text-2xl">{title}</p>
      {description && (
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ht-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
