"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import InfoCard from "@/components/InfoCard";
import PageHeader from "@/components/PageHeader";
import { INFO_SECTIONS } from "@/lib/constants";

export default function InformacijePage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          label="Uputstva"
          title="Korisne informacije"
          description="Kućni red, smeštaj, ishrana, internet, vešeraj i održavanje"
          icon="scroll"
        />

        <div className="space-y-3">
          {INFO_SECTIONS.map((section) => (
            <InfoCard
              key={section.id}
              title={section.title}
              content={section.content}
              icon={section.icon}
            />
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
