"use client";

interface StepProps {
  number: number;
  title: string;
  description: string;
  hint?: string;
}

export function InstallStep({ number, title, description, hint }: StepProps) {
  return (
    <li className="flex gap-4 sm:gap-5">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center bg-ht-navy text-xl font-semibold text-white sm:h-14 sm:w-14 sm:text-2xl"
        aria-hidden="true"
      >
        {number}
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <p className="text-lg font-semibold leading-snug text-ht-navy sm:text-xl">
          {title}
        </p>
        <p className="mt-1.5 text-base leading-relaxed text-ht-text sm:text-lg">
          {description}
        </p>
        {hint && (
          <p className="mt-2 text-sm text-ht-muted sm:text-base">{hint}</p>
        )}
      </div>
    </li>
  );
}

export function ShareIcon() {
  return (
    <svg
      className="inline-block h-6 w-6 align-text-bottom text-ht-navy"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

export function MenuDotsIcon() {
  return (
    <span
      className="inline-flex h-8 w-8 items-center justify-center border border-ht-border bg-ht-cream text-lg font-bold text-ht-navy"
      aria-hidden="true"
    >
      ⋮
    </span>
  );
}
