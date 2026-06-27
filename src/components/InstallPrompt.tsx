"use client";

import Link from "next/link";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { AppIcon } from "@/lib/icons";

type InstallPromptVariant = "card" | "panel" | "compact";

interface InstallPromptProps {
  variant?: InstallPromptVariant;
}

export default function InstallPrompt({ variant = "panel" }: InstallPromptProps) {
  const {
    mounted,
    installed,
    platform,
    installing,
    canNativeInstall,
    isIOSDevice,
    isAndroidDevice,
    handleInstallClick,
  } = useInstallPrompt();

  if (!mounted) return null;

  if (installed) {
    if (variant === "card") return null;
    return (
      <div className="ht-panel-bordered p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-800">
          <AppIcon name="check" className="h-6 w-6" />
        </div>
        <p className="text-lg font-medium text-ht-green sm:text-xl">
          Aplikacija je instalirana.
        </p>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Link
        href="/instalacija"
        className="ht-panel ht-card-hover group flex flex-col p-6 sm:p-7"
      >
        <div className="mb-5 flex h-11 w-11 items-center justify-center border border-ht-border-light bg-ht-cream/40 text-ht-navy transition-colors group-hover:border-ht-gold/40 group-hover:bg-ht-navy group-hover:text-ht-gold-light">
          <AppIcon name="install" className="h-5 w-5" />
        </div>
        <h3 className="ht-display text-xl text-ht-navy">Instaliraj aplikaciju</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ht-muted sm:text-base">
          Korak-po-korak uputstvo za iPhone i Android
        </p>
        <span className="mt-4 text-sm font-medium text-ht-gold group-hover:text-ht-navy">
          Pogledaj uputstvo →
        </span>
      </Link>
    );
  }

  const panelClass =
    variant === "compact"
      ? "ht-panel-bordered p-5"
      : "ht-panel-bordered p-6 sm:p-8";

  if (canNativeInstall) {
    return (
      <div className={`${panelClass} text-center`}>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-ht-border-light bg-ht-cream/50 text-ht-navy">
          <AppIcon name="install" className="h-6 w-6" />
        </div>
        <p className="mb-5 text-base text-ht-text sm:text-lg">
          Pritisnite dugme ispod. Telefon će tražiti vašu potvrdu.
        </p>
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={installing}
          className="ht-btn-primary inline-flex w-full items-center justify-center gap-2 py-5 text-lg sm:text-xl"
        >
          <AppIcon name="install" className="h-5 w-5" />
          {installing ? "Instaliranje..." : "Instaliraj aplikaciju"}
        </button>
      </div>
    );
  }

  if (isIOSDevice && (platform === "ios-safari" || platform === "ios-other")) {
    return (
      <div className={panelClass}>
        <div className="mb-4 flex items-center gap-3">
          <AppIcon name="install" className="h-5 w-5 text-ht-navy" />
          <p className="text-base font-semibold text-ht-navy sm:text-lg">
            Instalacija na iPhone ili iPad
          </p>
        </div>
        {platform === "ios-other" ? (
          <p className="mb-4 text-base leading-relaxed text-ht-danger">
            Prvo otvorite ovu stranicu u Safari pregledaču.
          </p>
        ) : null}
        <p className="text-base leading-relaxed text-ht-text sm:text-lg">
          Otvorite u Safari-ju, pritisnite <strong>Share</strong>, zatim{" "}
          <strong>Add to Home Screen</strong>.
        </p>
        <Link href="/instalacija" className="mt-5 inline-flex items-center gap-1 text-base font-medium text-ht-navy underline underline-offset-2">
          Detaljno uputstvo →
        </Link>
      </div>
    );
  }

  if (isAndroidDevice) {
    return (
      <div className={panelClass}>
        <div className="mb-4 flex items-center gap-3">
          <AppIcon name="install" className="h-5 w-5 text-ht-navy" />
          <p className="text-base font-semibold text-ht-navy sm:text-lg">
            Instalacija na Android telefonu
          </p>
        </div>
        <p className="text-base leading-relaxed text-ht-text sm:text-lg">
          Otvorite u Chrome-u, meni <strong>⋮</strong>, zatim{" "}
          <strong>Dodaj na početni ekran</strong>.
        </p>
        <Link href="/instalacija" className="mt-5 inline-flex items-center gap-1 text-base font-medium text-ht-navy underline underline-offset-2">
          Detaljno uputstvo →
        </Link>
      </div>
    );
  }

  if (platform === "desktop") {
    return (
      <div className={panelClass}>
        <div className="mb-4 flex items-center gap-3">
          <AppIcon name="qr" className="h-5 w-5 text-ht-navy" />
          <p className="text-base font-semibold text-ht-navy sm:text-lg">
            Instalacija na računaru
          </p>
        </div>
        <p className="mb-5 text-base leading-relaxed text-ht-text">
          Otvorite aplikaciju na telefonu putem QR koda ili koristite Chrome
          instalacionu ikonu u adresnoj traci.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/qr" className="ht-btn-primary inline-flex items-center justify-center gap-2 text-center">
            <AppIcon name="qr" className="h-4 w-4" />
            QR kod
          </Link>
          <Link href="/instalacija" className="ht-btn-secondary inline-flex items-center justify-center gap-2 text-center">
            <AppIcon name="install" className="h-4 w-4" />
            Uputstvo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={panelClass}>
      <p className="text-base leading-relaxed text-ht-text sm:text-lg">
        Za instalaciju otvorite aplikaciju u Safari (iPhone) ili Chrome (Android).
      </p>
      <Link href="/instalacija" className="mt-5 inline-block text-base font-medium text-ht-navy underline underline-offset-2">
        Detaljno uputstvo →
      </Link>
    </div>
  );
}
