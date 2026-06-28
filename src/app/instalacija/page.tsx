"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstallGuide from "@/components/InstallGuide";
import PageHeader from "@/components/PageHeader";
import { AppIcon } from "@/lib/icons";

export default function InstalacijaPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          label="Pristup"
          title="Instalacija aplikacije"
          description="Dodajte Vojni hotel na početni ekran telefona — jednostavno uputstvo korak po korak"
          icon="install"
        />

        <InstallGuide />

        <div className="ht-panel-bordered mt-8 p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-ht-border-light bg-ht-cream/50 text-ht-navy">
            <AppIcon name="qr" className="h-6 w-6" />
          </div>
          <p className="text-base text-ht-muted sm:text-lg">
            Imate drugi telefon? Skenirajte QR kod da otvorite aplikaciju.
          </p>
          <Link href="/qr" className="ht-btn-secondary mt-5 inline-flex items-center gap-2">
            <AppIcon name="qr" className="h-4 w-4" />
            Prikaži QR kod
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
