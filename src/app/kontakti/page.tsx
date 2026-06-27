"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ContactCard from "@/components/ContactCard";
import PageHeader from "@/components/PageHeader";
import { CONTACTS } from "@/lib/constants";

export default function KontaktiPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-3xl">
        <PageHeader
          label="Komunikacija"
          title="Kontakti"
          description="Uprava hotela, dežurna služba, održavanje i hitni brojevi"
          icon="phone"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {CONTACTS.map((contact) => (
            <ContactCard
              key={contact.id}
              title={contact.title}
              phone={contact.phone}
              displayPhone={contact.displayPhone}
              description={contact.description}
              icon={contact.icon}
            />
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
