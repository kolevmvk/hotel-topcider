"use client";

import Link from "next/link";
import { AppIcon, ChevronRight, type IconName } from "@/lib/icons";

export interface StepItem {
  label: string;
  description?: string;
  done?: boolean;
  active?: boolean;
}

interface StepGuideProps {
  steps: StepItem[];
  title?: string;
}

export default function StepGuide({ steps, title }: StepGuideProps) {
  return (
    <div className="ht-step-guide">
      {title && (
        <p className="ht-label mb-3">{title}</p>
      )}
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li
            key={step.label}
            className={`ht-step flex gap-3 ${step.active ? "ht-step-active" : ""} ${step.done ? "ht-step-done" : ""}`}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
              aria-hidden
            >
              {step.done ? (
                <AppIcon name="check" className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </span>
            <div>
              <p className="font-medium text-ht-navy">{step.label}</p>
              {step.description && (
                <p className="mt-0.5 text-sm text-ht-muted">{step.description}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

interface ActionBannerProps {
  title: string;
  description: string;
  href: string;
  icon?: IconName;
  variant?: "default" | "urgent" | "gold";
}

export function ActionBanner({
  title,
  description,
  href,
  icon = "report",
  variant = "default",
}: ActionBannerProps) {
  const border =
    variant === "urgent"
      ? "border-l-ht-danger"
      : variant === "gold"
        ? "border-l-ht-gold"
        : "border-l-ht-navy";

  return (
    <Link
      href={href}
      className={`ht-action-banner ht-panel-bordered flex items-start gap-4 border-l-[3px] p-5 transition-colors hover:bg-ht-cream/30 sm:p-6 ${border}`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-ht-border-light bg-ht-cream/40 text-ht-navy">
        <AppIcon name={icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ht-navy">{title}</p>
        <p className="mt-1 text-sm text-ht-muted">{description}</p>
      </div>
      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-ht-gold" strokeWidth={1.75} />
    </Link>
  );
}
