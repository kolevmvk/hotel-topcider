"use client";

import { useState } from "react";
import type { IconName } from "@/lib/icons";
import { AppIcon } from "@/lib/icons";

interface InfoCardProps {
  title: string;
  content: string;
  icon?: IconName;
}

export default function InfoCard({ title, content, icon = "info" }: InfoCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="ht-panel-bordered overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="touch-target flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-ht-cream/20 sm:px-7 sm:py-6"
        aria-expanded={expanded}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-ht-border-light bg-ht-cream/40 text-ht-navy">
            <AppIcon name={icon} className="h-4 w-4" />
          </span>
          <span className="ht-display text-xl text-ht-navy">{title}</span>
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-ht-gold transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="border-t border-ht-border-light px-6 pb-6 pt-4 sm:px-7 sm:pb-7">
          <p className="whitespace-pre-wrap text-base leading-relaxed text-ht-text">{content}</p>
        </div>
      )}
    </article>
  );
}
