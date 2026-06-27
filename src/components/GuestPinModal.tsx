"use client";

import { useEffect } from "react";
import Link from "next/link";

interface GuestPinModalProps {
  open: boolean;
  guestName: string;
  room: string;
  pin: string;
  onClose: () => void;
}

export default function GuestPinModal({
  open,
  guestName,
  room,
  pin,
  onClose,
}: GuestPinModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function copyPin() {
    try {
      await navigator.clipboard.writeText(pin);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="ht-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="ht-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="ht-display text-xl text-ht-navy">Prosledite gostu</h2>
        <p className="mt-2 text-sm text-ht-muted">
          Nalog za <strong>{guestName}</strong> je kreiran. Prosledite PIN gostu — prijava na tabu Gost.
        </p>
        <dl className="mt-4 space-y-2 rounded-lg bg-ht-cream/50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ht-muted">Soba</dt>
            <dd className="font-semibold text-ht-navy">{room}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ht-muted">PIN</dt>
            <dd className="font-mono font-semibold text-ht-navy">{pin}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={copyPin} className="ht-btn-secondary flex-1">
            Kopiraj PIN
          </button>
          <Link href="/login" className="ht-btn-secondary flex-1 text-center">
            Link za login
          </Link>
          <button type="button" onClick={onClose} className="ht-btn-primary flex-1">
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
}
