"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import InfoCard from "@/components/InfoCard";
import PageHeader from "@/components/PageHeader";
import { getInfoSections } from "@/lib/storage";
import type { InfoSection } from "@/lib/types";
import type { IconName } from "@/lib/icons";
import { useAuth } from "@/components/AuthProvider";
import { upravaTabHref } from "@/lib/navigation";

export default function InformacijePage() {
  const { isUpravnik } = useAuth();
  const [sections, setSections] = useState<InfoSection[]>([]);

  const refresh = useCallback(() => {
    setSections(getInfoSections());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
          {sections.map((section) => (
            <InfoCard
              key={section.id}
              title={section.title}
              content={section.content}
              icon={section.icon as IconName}
            />
          ))}
        </div>

        {isUpravnik && (
          <p className="mt-8 text-center">
            <Link
              href={upravaTabHref("content")}
              className="text-base font-semibold text-ht-navy underline underline-offset-4"
            >
              Uređivanje informacija u panelu upravnika →
            </Link>
          </p>
        )}
      </div>
    </ProtectedRoute>
  );
}
