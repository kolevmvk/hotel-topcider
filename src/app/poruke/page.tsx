"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import MessagesView from "@/components/MessagesView";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";

export default function PorukePage() {
  const { isStanar, isGost, isUpravnik, isDezurni } = useAuth();

  const description = isGost
    ? "Kontakt sa dežurnom službom tokom privremenog boravka"
    : isStanar
      ? "Primajte poruke od uprave i obratite se upravniku ili dežurnoj službi"
      : isUpravnik
        ? "Direktna komunikacija sa stanarima i pregled obraćanja"
        : isDezurni
          ? "Poruke stanara i komunikacija sa upravnikom"
          : "Službena komunikacija hotela";

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          label="Komunikacija"
          title="Poruke"
          description={description}
          icon="mail"
        />
        <MessagesView />
      </div>
    </ProtectedRoute>
  );
}
