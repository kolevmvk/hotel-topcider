import type { ProblemStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: ProblemStatus;
  className?: string;
}

const STATUS_STYLES: Record<ProblemStatus, string> = {
  Primljeno: "bg-ht-cream text-ht-navy ring-1 ring-ht-border",
  "U radu": "bg-amber-50 text-amber-900 ring-1 ring-amber-200/70",
  Rešeno: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70",
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span className={`ht-badge ${STATUS_STYLES[status]} ${className}`}>
      {status}
    </span>
  );
}

export function UrgentBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`ht-badge-urgent inline-flex items-center gap-1.5 ${className}`}>
      Hitno
    </span>
  );
}

export function ConfirmationBadge({
  preduzeteMere,
}: {
  preduzeteMere: boolean;
}) {
  return (
    <span
      className={`ht-badge ${
        preduzeteMere
          ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70"
          : "bg-ht-danger-bg text-ht-danger ring-1 ring-ht-danger/20"
      }`}
    >
      {preduzeteMere ? "Mere preduzete" : "Mere nisu preduzete"}
    </span>
  );
}
