"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PORTAL_LOGIN_LEAD } from "@/lib/presentation";
import { CONTACTS } from "@/lib/constants";
import { loginDezurni, loginGost, loginStanar, loginUpravnik } from "@/lib/auth";
import { trackBusiness } from "@/lib/analytics/client";
import { AppIcon } from "@/lib/icons";
import RoleQuickAccess from "@/components/RoleQuickAccess";
import { useAuth } from "./AuthProvider";

type Tab = "stanar" | "gost" | "dezurni" | "upravnik";

const TABS: { key: Tab; label: string; icon: "home" | "bed" | "clock" | "shield" }[] = [
  { key: "stanar", label: "Stanar", icon: "home" },
  { key: "gost", label: "Gost", icon: "bed" },
  { key: "dezurni", label: "Dežurni", icon: "clock" },
  { key: "upravnik", label: "Upravnik", icon: "shield" },
];

export default function LoginForm() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [tab, setTab] = useState<Tab>("stanar");
  const [room, setRoom] = useState("");
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function logAppLoginAttempt(
    loginType: Tab,
    identifier: string,
    success: boolean
  ) {
    try {
      await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginType, identifier, success }),
      });
      trackBusiness("app.login", { loginType, identifier, success }, "app.login", loginType);
    } catch {
      /* audit ne sme blokirati prijavu */
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    let result: { success: boolean; error?: string };
    const identifier =
      tab === "stanar" || tab === "gost" ? room.trim() : username.trim();

    if (tab === "stanar") {
      result = loginStanar({ room, pin });
    } else if (tab === "gost") {
      result = loginGost({ room, pin });
    } else if (tab === "dezurni") {
      result = loginDezurni({ username, pin });
    } else {
      result = loginUpravnik({ username, pin });
    }

    await logAppLoginAttempt(tab, identifier || "(prazno)", result.success);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Greška pri prijavi.");
      return;
    }

    refreshSession();
    router.push("/");
  }

  function switchTab(next: Tab) {
    setTab(next);
    setError("");
    setPin("");
  }

  const isStaffTab = tab === "dezurni" || tab === "upravnik";

  return (
    <div className="w-full">
      <header className="mb-5 flex items-center gap-3.5">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center border border-ht-gold/50 bg-ht-navy text-xs font-bold tracking-[0.15em] text-ht-gold-light"
          aria-hidden="true"
        >
          VH
        </div>
        <div>
          <h1 className="ht-display text-2xl leading-tight text-ht-navy sm:text-3xl">
            Vojni hotel
          </h1>
        </div>
      </header>

      <p className="mb-5 text-sm leading-relaxed text-ht-muted">{PORTAL_LOGIN_LEAD}</p>

      <div className="mb-5 grid grid-cols-2 border border-ht-border bg-ht-cream/40 p-1 sm:grid-cols-4">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => switchTab(key)}
            data-track={`login.tab.${key}`}
            data-track-label={label}
            className={`touch-target flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold uppercase tracking-wide transition-colors sm:flex-row sm:gap-2 sm:text-sm ${
              tab === key
                ? "bg-ht-navy text-white"
                : "text-ht-text hover:bg-white/60"
            }`}
          >
            <AppIcon name={icon} className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm leading-relaxed text-ht-muted">
        {tab === "stanar" &&
          "Stanari: broj sobe i PIN. Novi korisnici šalju zahtev upravniku na registraciji."}
        {tab === "gost" &&
          "Privremeni boravak — broj sobe i PIN koje vam dodeli dežurna služba."}
        {tab === "dezurni" && "Dežurna služba — službeni nalog hotela (korisničko ime i PIN)."}
        {tab === "upravnik" && "Upravnik hotela — službeni nalog (korisničko ime i PIN)."}
      </p>

      <form onSubmit={handleSubmit} className="ht-panel-bordered p-5 sm:p-6">
        {!isStaffTab ? (
          <>
            <div className="mb-5">
              <label htmlFor="room" className="ht-field-label">Broj sobe</label>
              <input
                id="room"
                type="text"
                inputMode="numeric"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                required
                autoComplete="off"
                placeholder="npr. 205"
                className="ht-input"
              />
            </div>
            <div className="mb-5">
              <label htmlFor="pin" className="ht-field-label">PIN</label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                minLength={4}
                autoComplete="off"
                placeholder="••••"
                className="ht-input"
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-5">
              <label htmlFor="username" className="ht-field-label">Korisničko ime</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder={tab === "dezurni" ? "dezurni" : "upravnik"}
                className="ht-input"
              />
            </div>
            <div className="mb-5">
              <label htmlFor="staff-pin" className="ht-field-label">PIN</label>
              <input
                id="staff-pin"
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                minLength={4}
                autoComplete="off"
                placeholder="••••"
                className="ht-input"
              />
            </div>
          </>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 border-l-[3px] border-ht-danger bg-ht-danger-bg px-4 py-3 text-base font-medium text-ht-danger"
          >
            <AppIcon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="ht-btn-primary w-full">
          {loading ? "Prijava..." : "Prijavi se"}
        </button>

        {tab === "gost" && (
          <div className="mt-5 space-y-3">
            <div className="rounded-lg border border-ht-border-light bg-ht-cream/50 px-4 py-3 text-sm">
              <p className="font-medium text-ht-navy">Nemate PIN?</p>
              <p className="mt-1 text-ht-muted">
                Javite se dežurnoj službi — dodeliće vam pristup za privremeni boravak.
              </p>
              {(() => {
                const dezurna = CONTACTS.find((c) => c.id === "dezurna");
                if (!dezurna) return null;
                return (
                  <a
                    href={`tel:${dezurna.phone}`}
                    className="mt-2 inline-flex items-center gap-1.5 font-semibold text-ht-navy underline underline-offset-2"
                  >
                    <AppIcon name="phone" className="h-3.5 w-3.5" />
                    {dezurna.displayPhone}
                  </a>
                );
              })()}
            </div>
          </div>
        )}
        {tab === "stanar" && (
          <p className="mt-5 text-center">
            <Link
              href="/register"
              className="text-base font-semibold text-ht-navy underline underline-offset-4 hover:text-ht-gold"
            >
              Nemate nalog? Napravite nalog
            </Link>
          </p>
        )}
      </form>

      <RoleQuickAccess />

      <p className="mt-6 text-center text-sm leading-relaxed text-ht-muted">
        Ako imate problem sa prijavom, javite se dežurnoj službi.
      </p>
    </div>
  );
}
