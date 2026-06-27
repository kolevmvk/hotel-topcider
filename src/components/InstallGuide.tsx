"use client";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { AppIcon, Smartphone } from "@/lib/icons";
import InstallPrompt from "./InstallPrompt";
import { InstallStep, MenuDotsIcon, ShareIcon } from "./InstallSteps";
import { getPlatformLabel } from "@/lib/installDetect";

export default function InstallGuide() {
  const { mounted, installed, platform, canNativeInstall } = useInstallPrompt();

  if (!mounted) return null;

  if (installed) {
    return <InstallPrompt variant="panel" />;
  }

  return (
    <div className="space-y-6">
      <InstallPrompt variant="panel" />

      {!canNativeInstall && (
        <>
          <div className="ht-panel-bordered flex items-start gap-4 border-l-[3px] border-l-ht-gold p-6 sm:p-8">
            <Smartphone className="mt-0.5 h-6 w-6 shrink-0 text-ht-gold" strokeWidth={1.75} />
            <div>
              <p className="ht-label mb-2">Vaš uređaj</p>
              <p className="text-lg font-medium text-ht-navy">{getPlatformLabel(platform)}</p>
            </div>
          </div>

          {platform === "ios-safari" && (
            <DetailPanel title="Koraci za iPhone ili iPad" icon="install">
              <ol className="space-y-6">
                <InstallStep
                  number={1}
                  title="Pritisnite Share na dnu ekrana"
                  description="Ikona sa strelicom nagore, u Safari-ju na sredini donje trake."
                />
                <div className="ml-16 flex items-center gap-2 text-ht-text">
                  <ShareIcon />
                  <span className="text-base font-medium">Share</span>
                </div>
                <InstallStep
                  number={2}
                  title="Izaberite Add to Home Screen"
                  description="Listajte opcije nadole dok ne pronađete ovu stavku."
                />
                <InstallStep
                  number={3}
                  title="Pritisnite Add"
                  description="Potvrdite. Ikona Topčider će biti na početnom ekranu."
                />
              </ol>
            </DetailPanel>
          )}

          {(platform === "android-chrome" ||
            platform === "android-samsung" ||
            platform === "android-other" ||
            platform === "unknown") && (
            <DetailPanel title="Koraci za Android" icon="install">
              <ol className="space-y-6">
                <InstallStep
                  number={1}
                  title="Otvorite u Chrome-u"
                  description="Instalacija radi najpouzdanije u Chrome pregledaču."
                />
                <InstallStep
                  number={2}
                  title="Pritisnite meni ⋮ gore desno"
                  description="Tri tačke u gornjem desnom uglu ekrana."
                />
                <div className="ml-16">
                  <MenuDotsIcon />
                </div>
                <InstallStep
                  number={3}
                  title="Izaberite Dodaj na početni ekran"
                  description="Potvrdite dodavanje. Aplikacija će biti na početnom ekranu."
                />
              </ol>
            </DetailPanel>
          )}

          {platform === "ios-other" && (
            <DetailPanel title="Prvo otvorite Safari" icon="install">
              <ol className="space-y-6">
                <InstallStep
                  number={1}
                  title="Kopirajte adresu aplikacije"
                  description="U Chrome-u: Podeli → Kopiraj link."
                />
                <InstallStep
                  number={2}
                  title="Otvorite Safari i nalepite adresu"
                  description="Safari je plava ikona sa kompasom."
                />
                <InstallStep
                  number={3}
                  title="Share → Add to Home Screen → Add"
                  description="Pratite korake za iPhone iznad."
                />
              </ol>
            </DetailPanel>
          )}
        </>
      )}

      <div className="ht-panel-bordered flex items-start gap-3 bg-ht-cream/30 p-6 sm:p-8">
        <AppIcon name="phone" className="mt-0.5 h-5 w-5 shrink-0 text-ht-gold" />
        <p className="text-base leading-relaxed text-ht-text sm:text-lg">
          <strong className="font-semibold text-ht-navy">Potrebna pomoć?</strong>{" "}
          Javite se dežurnoj službi hotela.
        </p>
      </div>
    </div>
  );
}

function DetailPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: "install" | "qr";
  children: React.ReactNode;
}) {
  return (
    <div className="ht-panel-bordered p-6 sm:p-8">
      <h3 className="ht-display mb-6 flex items-center gap-3 text-xl text-ht-navy sm:text-2xl">
        {icon && (
          <span className="flex h-10 w-10 items-center justify-center border border-ht-border-light bg-ht-cream/50 text-ht-navy">
            <AppIcon name={icon} className="h-5 w-5" />
          </span>
        )}
        {title}
      </h3>
      {children}
    </div>
  );
}
