"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { AssistantContextResponse } from "@/lib/assistant/types";
import { AppIcon } from "@/lib/icons";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const CONSENT_KEY = "ht_assistant_consent";

export default function AssistantPanel() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<AssistantContextResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const hidden =
    pathname === "/access" ||
    pathname.startsWith("/interno");

  const loadContext = useCallback(async () => {
    try {
      const res = await fetch("/api/assistant/context");
      if (!res.ok) return;
      const data = (await res.json()) as AssistantContextResponse;
      if (!data.enabled) return;
      setContext(data);
      setMessages([{ role: "assistant", content: data.greeting }]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (hidden) return;
    loadContext();
    try {
      setConsented(localStorage.getItem(CONSENT_KEY) === "1");
    } catch {
      setConsented(false);
    }
  }, [hidden, loadContext]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading || !consented) return;

    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
      });
      const data = (await res.json()) as {
        sessionId?: string;
        reply?: string;
        error?: string;
        ollamaAvailable?: boolean;
      };

      if (!res.ok) {
        setError(data.error ?? "Greška pri slanju.");
        setLoading(false);
        return;
      }

      if (data.sessionId) setSessionId(data.sessionId);
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
      }
      if (data.ollamaAvailable === false && context) {
        setError("Lokalni AI nije dostupan — prikazan je osnovni odgovor.");
      }
    } catch {
      setError("Asistent trenutno nije dostupan.");
    } finally {
      setLoading(false);
    }
  }

  function acceptConsent() {
    try {
      localStorage.setItem(CONSENT_KEY, "1");
    } catch {
      /* ignore */
    }
    setConsented(true);
  }

  if (hidden || !context?.enabled) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center border-2 border-ht-gold bg-ht-navy text-ht-gold-light shadow-lg lg:bottom-8"
          aria-label="Otvori asistenta"
          data-track-no-auto
        >
          <AppIcon name="info" className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/30 lg:bg-transparent"
          data-track-no-auto
        >
          <div className="flex h-full w-full max-w-md flex-col border-l border-ht-border bg-white shadow-2xl lg:relative lg:h-[calc(100dvh-2rem)] lg:mt-4 lg:mr-4 lg:rounded-none lg:border lg:shadow-xl">
            <header className="flex items-center justify-between border-b border-ht-border bg-ht-navy px-4 py-3 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ht-gold-light">
                  Asistent hotela
                </p>
                <p className="text-sm font-medium">{context.organization}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-2 py-1 text-sm text-white/80 hover:text-white"
                aria-label="Zatvori"
              >
                ✕
              </button>
            </header>

            {!context.ollamaAvailable && (
              <p className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-950">
                Lokalni AI (Ollama) nije pokrenut — odgovori su ograničeni.
              </p>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={`${i}-${msg.content.slice(0, 20)}`}
                  className={`max-w-[90%] px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "ml-auto bg-ht-navy text-white"
                      : "bg-ht-cream/60 text-ht-text border border-ht-border-light"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {loading && (
                <p className="text-xs text-ht-muted">Asistent piše…</p>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-ht-border p-4">
              {!consented ? (
                <div className="space-y-3">
                  <p className="text-xs leading-relaxed text-ht-muted">{context.consentText}</p>
                  <button type="button" onClick={acceptConsent} className="ht-btn-primary w-full text-sm">
                    Nastavi razgovor
                  </button>
                </div>
              ) : (
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Postavite pitanje…"
                    className="ht-input flex-1 text-sm"
                    disabled={loading}
                    maxLength={2000}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="ht-btn-primary shrink-0 px-4 text-sm disabled:opacity-60"
                  >
                    Pošalji
                  </button>
                </form>
              )}
              {error && (
                <p className="mt-2 text-xs text-ht-danger" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            className="flex-1 lg:hidden"
            aria-label="Zatvori"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
