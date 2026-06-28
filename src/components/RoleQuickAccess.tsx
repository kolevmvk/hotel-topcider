"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEMO_ACCOUNTS } from "@/lib/demoData";
import { isPresentationMode } from "@/lib/presentation";
import { ensureDemoData } from "@/lib/seedDemo";
import { loginDezurni, loginGost, loginStanar, loginUpravnik } from "@/lib/auth";
import { AppIcon } from "@/lib/icons";
import { useAuth } from "./AuthProvider";

const ROLE_ICON: Record<string, "shield" | "clock" | "home" | "bed"> = {
  upravnik: "shield",
  dezurni: "clock",
  stanar: "home",
  gost: "bed",
};

const ACCOUNTS = [
  { key: "upravnik", account: DEMO_ACCOUNTS.upravnik },
  { key: "dezurni", account: DEMO_ACCOUNTS.dezurni },
  { key: "stanar1", account: DEMO_ACCOUNTS.stanar1 },
  { key: "gost1", account: DEMO_ACCOUNTS.gost1 },
] as const;

export default function RoleQuickAccess() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  if (!isPresentationMode()) return null;

  function quickLogin(
    key: string,
    fn: () => { success: boolean; error?: string }
  ) {
    ensureDemoData();
    setLoading(key);
    const result = fn();
    setLoading(null);
    if (result.success) {
      refreshSession();
      router.push("/");
    }
  }

  return (
    <section className="mt-8 border-t border-ht-border-light pt-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-ht-muted">
        Brzi ulaz
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {ACCOUNTS.map(({ key, account }) => (
          <button
            key={key}
            type="button"
            disabled={loading !== null}
            onClick={() => {
              if (account.role === "upravnik") {
                quickLogin(key, () =>
                  loginUpravnik({ username: account.username, pin: account.pin })
                );
              } else if (account.role === "dezurni") {
                quickLogin(key, () =>
                  loginDezurni({ username: account.username, pin: account.pin })
                );
              } else if (account.role === "gost") {
                quickLogin(key, () =>
                  loginGost({ room: account.room, pin: account.pin })
                );
              } else {
                quickLogin(key, () =>
                  loginStanar({ room: account.room, pin: account.pin })
                );
              }
            }}
            className="touch-target flex items-center gap-3 border border-ht-border-light bg-white px-3 py-2.5 text-left text-sm transition-colors hover:border-ht-gold/40 hover:bg-ht-cream/30 disabled:opacity-60"
          >
            <AppIcon name={ROLE_ICON[account.role] ?? "home"} className="h-4 w-4 shrink-0 text-ht-navy" />
            <span className="font-medium text-ht-navy">{account.label}</span>
            <span className="ml-auto text-xs text-ht-muted">
              {loading === key ? "…" : "→"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
