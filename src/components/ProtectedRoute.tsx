"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import type { UserRole } from "@/lib/types";

interface ProtectedRouteProps {
  children: ReactNode;
  /** @deprecated Koristiti staffOnly ili allowedRoles */
  adminOnly?: boolean;
  staffOnly?: boolean;
  upravnikOnly?: boolean;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  adminOnly = false,
  staffOnly = false,
  upravnikOnly = false,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isUpravnik, isStaff, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.replace("/");
      return;
    }

    if (upravnikOnly && !isUpravnik) {
      router.replace("/");
      return;
    }

    if ((adminOnly || staffOnly) && !isStaff) {
      router.replace("/");
    }
  }, [
    isAuthenticated,
    isUpravnik,
    isStaff,
    role,
    isLoading,
    adminOnly,
    staffOnly,
    upravnikOnly,
    allowedRoles,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-ht-muted">Učitavanje...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (allowedRoles && role && !allowedRoles.includes(role)) return null;
  if (upravnikOnly && !isUpravnik) return null;
  if ((adminOnly || staffOnly) && !isStaff) return null;

  return <>{children}</>;
}
