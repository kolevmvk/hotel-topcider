"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import HotelHero from "@/components/HotelHero";
import StatusInfoBlock from "@/components/StatusInfoBlock";
import HotelServiceBlock from "@/components/HotelServiceBlock";
import InstallBanner from "@/components/InstallBanner";
import InstallPrompt from "@/components/InstallPrompt";
import ShiftInbox from "@/components/ShiftInbox";
import ManagerDashboard from "@/components/ManagerDashboard";
import { ActionBanner } from "@/components/StepGuide";
import StepGuide from "@/components/StepGuide";
import { getGostHomeGuideSteps } from "@/components/MyRoomPanel";
import { useAuth } from "@/components/AuthProvider";
import { userNeedsRoomCheckIn } from "@/lib/dashboard";
import { getRoomByNumber } from "@/lib/rooms";
import { AppIcon, ChevronRight } from "@/lib/icons";
import type { DashboardItem } from "@/lib/navigation";
import { getDashboardSections, getHomeTagline } from "@/lib/navigation";
import { getHomeAction } from "@/lib/homeActions";
import { getUserById } from "@/lib/storage";

function DashboardCard({ item }: { item: DashboardItem }) {
  return (
    <Link
      href={item.href}
      className="ht-panel ht-card-hover group flex flex-col p-6 sm:p-7"
    >
      <div className="mb-5 flex h-11 w-11 items-center justify-center border border-ht-border-light bg-ht-cream/40 text-ht-navy transition-colors group-hover:border-ht-gold/40 group-hover:bg-ht-navy group-hover:text-ht-gold-light">
        <AppIcon name={item.icon} className="h-5 w-5" />
      </div>
      <h3 className="ht-display text-xl text-ht-navy">{item.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ht-muted sm:text-base">
        {item.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ht-gold transition-colors group-hover:text-ht-navy">
        Otvori
        <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
      </span>
    </Link>
  );
}

export default function HomePage() {
  const { isAuthenticated, isLoading, session, isStaff, isUpravnik, isDezurni, isGost, role } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const homeAction = useMemo(() => {
    if (!session || !role) return null;
    return getHomeAction(session, role);
  }, [session, role]);

  const boravakDo = useMemo(() => {
    if (!session?.userId) return undefined;
    return getUserById(session.userId)?.boravakDo;
  }, [session]);

  const gostGuideSteps = useMemo(() => {
    if (!isGost || !session?.room || !session.userId) return null;
    if (!userNeedsRoomCheckIn(session)) return null;
    const room = getRoomByNumber(session.room);
    if (!room) return null;
    return getGostHomeGuideSteps(session.userId, room.id);
  }, [isGost, session]);

  if (isLoading || !isAuthenticated || !role) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-ht-muted">Učitavanje...</p>
      </div>
    );
  }

  const roleLabel = isUpravnik
    ? "Upravnik hotela"
    : isDezurni
      ? "Dežurna služba"
      : isGost
        ? "Gost hotela"
        : undefined;

  const sections = getDashboardSections(role);
  const isResident = role === "stanar" || role === "gost";

  return (
    <ProtectedRoute>
      <div className="space-y-10">
        <HotelHero
          userName={session?.fullName}
          room={session?.room}
          roleLabel={roleLabel}
          tagline={getHomeTagline(role)}
          compact={isResident}
          boravakDo={isGost ? boravakDo : undefined}
        />

        {isDezurni && <ShiftInbox />}

        {isUpravnik && <ManagerDashboard />}

        {homeAction && (
          <ActionBanner
            title={homeAction.title}
            description={homeAction.description}
            href={homeAction.href}
            icon={homeAction.icon}
            variant={homeAction.variant}
          />
        )}

        {gostGuideSteps && (
          <div className="ht-panel-bordered p-5 sm:p-6">
            <StepGuide title="Vaš boravak — sledeći koraci" steps={gostGuideSteps} />
          </div>
        )}

        {!isStaff && <StatusInfoBlock />}

        {!isStaff && <InstallBanner />}

        {sections.map((section) => (
          <section key={section.label} aria-label={section.title}>
            <div className="mb-6">
              <p className="ht-label mb-2">{section.label}</p>
              <h2 className="ht-display text-2xl text-ht-navy sm:text-3xl">
                {section.title}
              </h2>
              <p className="mt-2 max-w-2xl text-base text-ht-muted">{section.subtitle}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <DashboardCard key={`${section.label}-${item.title}`} item={item} />
              ))}
              {section.label === "Vaš boravak" && <InstallPrompt />}
            </div>
          </section>
        ))}

        {!isStaff && <HotelServiceBlock />}
      </div>
    </ProtectedRoute>
  );
}
