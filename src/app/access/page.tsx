"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, Presentation } from "lucide-react";
import { APP_PHASE_LABEL, APP_PHASE_NOTICE } from "@/lib/constants";

export default function AccessPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/access/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError("Neispravni pristupni podaci.");
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
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-ht-gold/40 bg-ht-cream px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ht-navy">
          <Presentation className="h-3.5 w-3.5 text-ht-gold" aria-hidden />
          {APP_PHASE_LABEL}
        </span>
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border border-ht-gold/50 bg-ht-navy text-ht-gold">
          <ShieldCheck className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="ht-display text-2xl text-ht-navy">Pristup aplikaciji</h1>
        <p className="mt-2 text-sm text-ht-muted">
          Prvi pristup štiti celu aplikaciju; zatim se biraju uloge hotela (stanar, gost, dežurni, upravnik).
        </p>
        <p className="mt-3 rounded-lg border border-ht-border-light bg-ht-cream/50 px-3 py-2 text-xs leading-relaxed text-ht-muted">
          {APP_PHASE_NOTICE}
        </p>
      </div>

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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-ht-danger" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="ht-btn-primary flex w-full items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Provera…
              </>
            ) : (
              "Pristupi aplikaciji"
            )}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-ht-muted">
        Posle pristupa možete otvoriti pregled sistema na adresi /pregled.
      </p>
    </div>
  );
}
