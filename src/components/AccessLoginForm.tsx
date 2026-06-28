"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import { PORTAL_ACCESS_LEAD, PORTAL_ACCESS_TITLE } from "@/lib/presentation";

const RecaptchaWidget = dynamic(() => import("react-google-recaptcha"), {
  ssr: false,
});

function formatCountdown(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AccessLoginForm() {
  const router = useRouter();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [retryAfterSec, setRetryAfterSec] = useState(0);
  const [requireCaptcha, setRequireCaptcha] = useState(false);
  const [captchaEnabled, setCaptchaEnabled] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/access/status");
      if (!res.ok) return;
      const data = (await res.json()) as {
        retryAfterSec?: number;
        requireCaptcha?: boolean;
        captchaEnabled?: boolean;
      };
      setRetryAfterSec(data.retryAfterSec ?? 0);
      setRequireCaptcha(Boolean(data.requireCaptcha));
      setCaptchaEnabled(Boolean(data.captchaEnabled));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    if (retryAfterSec <= 0) return;
    const timer = setInterval(() => {
      setRetryAfterSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void refreshStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [retryAfterSec, refreshStatus]);

  const blocked = retryAfterSec > 0;
  const showCaptcha = requireCaptcha && captchaEnabled && siteKey;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (blocked) return;

    setError("");
    setLoading(true);

    let token: string | undefined;
    if (showCaptcha) {
      token = recaptchaToken ?? undefined;
      if (!token) {
        setError("Potvrdite dodatnu proveru bezbednosti.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/access/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, recaptchaToken: token }),
      });

      const data = (await res.json()) as {
        error?: string;
        retryAfterSec?: number;
        requireCaptcha?: boolean;
      };

      if (data.retryAfterSec) setRetryAfterSec(data.retryAfterSec);
      if (data.requireCaptcha !== undefined) setRequireCaptcha(data.requireCaptcha);

      setRecaptchaToken(null);

      if (!res.ok) {
        setError(data.error || "Neispravni pristupni podaci.");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError("Neispravni pristupni podaci.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border border-ht-gold/50 bg-ht-navy text-ht-gold">
          <ShieldCheck className="h-7 w-7" aria-hidden />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ht-gold">
          Vojni hotel
        </p>
        <h1 className="ht-display text-2xl text-ht-navy">{PORTAL_ACCESS_TITLE}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ht-muted">{PORTAL_ACCESS_LEAD}</p>
      </div>

      {blocked && (
        <div
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          <p className="font-medium">Privremena pauza</p>
          <p className="mt-1">
            Molimo sačekajte <strong>{formatCountdown(retryAfterSec)}</strong> pre novog pokušaja.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ht-panel-bordered p-5 sm:p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="access-username" className="ht-field-label">
              Korisničko ime
            </label>
            <input
              id="access-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="ht-input w-full"
              required
              disabled={loading || blocked}
            />
          </div>

          <div>
            <label htmlFor="access-password" className="ht-field-label">
              Lozinka
            </label>
            <input
              id="access-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ht-input w-full"
              required
              disabled={loading || blocked}
            />
          </div>

          {showCaptcha && !blocked && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-ht-muted">Dodatna provera bezbednosti</p>
              <RecaptchaWidget
                sitekey={siteKey}
                theme="light"
                onChange={(t) => setRecaptchaToken(t)}
                onExpired={() => setRecaptchaToken(null)}
              />
            </div>
          )}

          {error && (
            <p className="text-sm font-medium text-ht-danger" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || blocked}
            className="ht-btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Provera…
              </>
            ) : blocked ? (
              `Sačekajte ${formatCountdown(retryAfterSec)}`
            ) : (
              "Uđi u sistem"
            )}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-xs leading-relaxed text-ht-muted">
        Neuspešni pokušaji pristupa se evidentiraju. Posle više grešaka uključuje se
        dodatna provera i privremena pauza.
      </p>
    </div>
  );
}
