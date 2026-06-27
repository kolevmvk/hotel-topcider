"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isStandalone } from "@/lib/installDetect";
import { AppIcon } from "@/lib/icons";

const DISMISS_KEY = "ht_install_dismissed";

export default function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isStandalone()) return;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (!mounted || !visible) return null;

  return (
    <section
      className="ht-panel overflow-hidden border-l-[4px] border-l-ht-gold"
      aria-label="Predlog instalacije aplikacije"
    >
      <div className="bg-ht-navy p-6 sm:p-8">
        <p className="ht-label mb-2 flex items-center gap-2 text-ht-gold-light">
          <AppIcon name="install" className="h-3.5 w-3.5" />
          Preporučeno
        </p>
        <h2 className="ht-display text-2xl text-white sm:text-3xl">
          Instalirajte aplikaciju na telefon
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
          Jednom instalirate — zatim otvarate kao običnu aplikaciju sa
          početnog ekrana. Brže i jednostavnije.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/instalacija"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 bg-white px-8 py-4 text-lg font-semibold text-ht-navy transition-colors hover:bg-ht-cream"
          >
            <AppIcon name="install" className="h-5 w-5" />
            Uputstvo za instalaciju
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="min-h-[44px] px-4 text-base text-white/70 transition-colors hover:text-white"
          >
            Kasnije
          </button>
        </div>
      </div>
    </section>
  );
}
