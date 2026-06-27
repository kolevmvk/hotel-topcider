"use client";

import { Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminPanel from "@/components/AdminPanel";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";

export default function UpravaPage() {
  const { isUpravnik, isDezurni } = useAuth();

  return (
    <ProtectedRoute staffOnly>
      <div>
        <PageHeader
          label="Uprava"
          title={isUpravnik ? "Panel upravnika" : "Dežurna evidencija"}
          description={
            isUpravnik
              ? "Upravljanje obaveštenjima, evidencija prijava i pregled korisnika"
              : isDezurni
                ? "Pregled prijava stanara i potvrda preduzetih mera"
                : "Evidencija hotela"
          }
          icon={isUpravnik ? "shield" : "clock"}
        />
        <Suspense fallback={<p className="text-ht-muted">Učitavanje panela…</p>}>
          <AdminPanel />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
