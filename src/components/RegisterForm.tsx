"use client";

import Link from "next/link";
import { useState } from "react";
import { registerStanar } from "@/lib/auth";
import { AppIcon } from "@/lib/icons";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [room, setRoom] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptRules, setAcceptRules] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = registerStanar({
      firstName,
      lastName,
      room,
      pin,
      confirmPin,
      phone: phone || undefined,
      acceptRules,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Greška pri registraciji.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md">
        <div className="ht-panel-bordered px-6 py-12 text-center sm:px-10 sm:py-14">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-ht-gold/40 bg-ht-cream/50 text-ht-navy">
            <AppIcon name="check" className="h-7 w-7" />
          </div>
          <p className="ht-display text-2xl text-ht-navy">Zahtev poslat</p>
          <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-ht-muted">
            Vaš nalog čeka odobrenje upravnika hotela. Prijava će biti moguća
            tek nakon što uprava odobri pristup.
          </p>
          <p className="mt-4 text-sm text-ht-muted">
            Soba {room} · {firstName} {lastName}
          </p>
          <Link href="/login" className="ht-btn-primary mt-8 inline-flex">
            Nazad na prijavu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <p className="ht-label mb-2">Registracija stanara</p>
        <h1 className="ht-display text-3xl text-ht-navy">Kreiranje naloga</h1>
        <p className="mt-2 text-base leading-relaxed text-ht-muted">
          Nalog mora odobriti upravnik hotela pre prve prijave
        </p>
      </div>

      <form onSubmit={handleSubmit} className="ht-panel-bordered p-6 sm:p-8">
        <div className="mb-5">
          <label htmlFor="firstName" className="ht-field-label mb-2 block">Ime *</label>
          <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" className="ht-input" />
        </div>

        <div className="mb-5">
          <label htmlFor="lastName" className="ht-field-label mb-2 block">Prezime *</label>
          <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" className="ht-input" />
        </div>

        <div className="mb-5">
          <label htmlFor="reg-room" className="ht-field-label mb-2 block">Broj sobe *</label>
          <input id="reg-room" type="text" inputMode="numeric" value={room} onChange={(e) => setRoom(e.target.value)} required autoComplete="off" placeholder="npr. 205" className="ht-input" />
        </div>

        <div className="mb-5">
          <label htmlFor="reg-pin" className="ht-field-label mb-2 block">PIN * (min. 4 cifre)</label>
          <input id="reg-pin" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} required minLength={4} autoComplete="new-password" className="ht-input" />
        </div>

        <div className="mb-5">
          <label htmlFor="confirmPin" className="ht-field-label mb-2 block">Potvrda PIN-a *</label>
          <input id="confirmPin" type="password" inputMode="numeric" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} required minLength={4} autoComplete="new-password" className="ht-input" />
        </div>

        <div className="mb-5">
          <label htmlFor="phone" className="ht-field-label mb-2 block">Telefon (opciono)</label>
          <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+381 6x xxx xxxx" className="ht-input" />
        </div>

        <label className="mb-6 flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={acceptRules} onChange={(e) => setAcceptRules(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-ht-navy" />
          <span className="text-sm leading-relaxed text-ht-muted">
            Prihvatam kućni red i pravila korišćenja aplikacije *
          </span>
        </label>

        {error && (
          <div role="alert" className="mb-5 flex items-start gap-3 border-l-[3px] border-ht-danger bg-ht-danger-bg px-4 py-3 text-base text-ht-danger">
            <AppIcon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="ht-btn-primary w-full disabled:opacity-60">
          {loading ? "Slanje zahteva..." : "Pošalji zahtev upravniku"}
        </button>
      </form>

      <p className="mt-6 text-center text-base">
        <Link href="/login" className="font-semibold text-ht-navy underline underline-offset-4 hover:text-ht-gold">
          Već imate nalog? Prijavite se
        </Link>
      </p>
    </div>
  );
}
