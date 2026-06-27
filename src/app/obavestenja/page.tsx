"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import NoticeCard from "@/components/NoticeCard";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/components/AuthProvider";
import { getNotices } from "@/lib/storage";
import { useEffect, useState } from "react";
import type { Notice } from "@/lib/types";
import Link from "next/link";
import { upravaTabHref } from "@/lib/navigation";

export default function ObavestenjaPage() {
  const { isStaff, isUpravnik } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const all = getNotices();
    setNotices(isStaff ? all : all.filter((n) => n.aktivno));
  }, [isStaff]);

  const urgent = notices.filter((n) => n.prioritet === "hitno" && n.aktivno);
  const regular = notices.filter((n) => n.prioritet === "obicno" && n.aktivno);
  const archive = isStaff ? notices.filter((n) => !n.aktivno) : [];

  return (
    <ProtectedRoute>
      <div>
        <PageHeader
          label="Informisanje"
          title="Obaveštenja"
          description={
            isStaff
              ? "Službene najave i informacije hotela — pregled svih objava"
              : "Aktuelne službene najave i informacije hotela"
          }
          icon="bell"
        />

        {notices.filter((n) => n.aktivno).length === 0 && archive.length === 0 ? (
          <EmptyState
            icon="bell"
            title="Nema aktuelnih obaveštenja"
            description="Kada hotel objavi novo obaveštenje, pojaviće se ovde."
          />
        ) : (
          <>
            {urgent.length > 0 && (
              <section className="mb-10">
                <h2 className="ht-label mb-4">Hitna obaveštenja</h2>
                <div className="space-y-4">
                  {urgent.map((notice) => (
                    <NoticeCard key={notice.id} notice={notice} showArchiveBadge={isStaff} />
                  ))}
                </div>
              </section>
            )}

            {regular.length > 0 && (
              <section className="mb-10">
                <h2 className="ht-label mb-4">Aktuelna obaveštenja</h2>
                <div className="space-y-4">
                  {regular.map((notice) => (
                    <NoticeCard key={notice.id} notice={notice} showArchiveBadge={isStaff} />
                  ))}
                </div>
              </section>
            )}

            {archive.length > 0 && (
              <section>
                <h2 className="ht-label mb-4">Arhiva</h2>
                <div className="space-y-4">
                  {archive.map((notice) => (
                    <NoticeCard key={notice.id} notice={notice} showArchiveBadge />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {isUpravnik && (
          <p className="mt-8 text-center">
            <Link href={upravaTabHref("content")} className="text-base font-semibold text-ht-navy underline underline-offset-4">
              Uređivanje obaveštenja u panelu upravnika →
            </Link>
          </p>
        )}
      </div>
    </ProtectedRoute>
  );
}
