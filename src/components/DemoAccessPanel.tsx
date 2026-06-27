"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEMO_ACCOUNTS } from "@/lib/demoData";
import { ensureDemoData } from "@/lib/seedDemo";
import { loginDezurni, loginGost, loginStanar, loginUpravnik } from "@/lib/auth";
import { useAuth } from "./AuthProvider";

const SHOW_DEMO =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_SHOW_DEMO === "true";

export default function DemoAccessPanel() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  if (!SHOW_DEMO) return null;

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

  const accounts = [
    { key: "upravnik", account: DEMO_ACCOUNTS.upravnik },
    { key: "dezurni", account: DEMO_ACCOUNTS.dezurni },
    { key: "stanar1", account: DEMO_ACCOUNTS.stanar1 },
    { key: "stanar2", account: DEMO_ACCOUNTS.stanar2 },
    { key: "stanar3", account: DEMO_ACCOUNTS.stanar3 },
    { key: "gost1", account: DEMO_ACCOUNTS.gost1 },
  ];

  return (
    <div className="border-t border-ht-border-light pt-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="touch-target flex w-full items-center justify-between gap-3 py-2 text-left"
      >
        <span className="text-sm font-medium text-ht-muted">
          Demo pristup
          <span className="ml-2 font-normal text-ht-muted/70">(samo razvoj)</span>
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-ht-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 space-y-2 border border-ht-border-light bg-ht-cream/20 p-3">
          {accounts.map(({ key, account }) => (
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
              className="touch-target w-full border border-ht-border-light bg-white p-3 text-left transition-colors hover:border-ht-gold/40 disabled:opacity-60"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ht-navy">{account.label}</span>
                <span className="text-xs text-ht-gold">
                  {loading === key ? "..." : "Uđi"}
                </span>
              </div>
              <span className="mt-1 block font-mono text-xs text-ht-muted">
                {account.role === "stanar" || account.role === "gost"
                  ? `Soba ${account.room} / ${account.pin}`
                  : `${account.username} / ${account.pin}`}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
