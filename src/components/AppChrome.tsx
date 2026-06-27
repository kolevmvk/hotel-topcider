"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import DemoSeed from "@/components/DemoSeed";

/** Rute bez headera i donje navigacije */
export const GATE_AND_AUTH_PATHS = ["/access", "/login", "/register"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const minimal = GATE_AND_AUTH_PATHS.includes(pathname);

  return (
    <AuthProvider>
      {!minimal && <Header />}
      <main
        className={
          minimal
            ? "mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8"
            : "mx-auto max-w-5xl px-4 py-8 pb-28 sm:px-6 sm:py-10 lg:px-8 lg:pb-10"
        }
      >
        {children}
      </main>
      {!minimal && <BottomNav />}
      <DemoSeed />
      <ServiceWorkerRegister />
    </AuthProvider>
  );
}
