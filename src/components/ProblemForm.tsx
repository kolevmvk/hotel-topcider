"use client";

import Link from "next/link";
import { useState } from "react";
import { PROBLEM_CATEGORIES } from "@/lib/constants";
import { AppIcon } from "@/lib/icons";
import { addProblem, generateId } from "@/lib/storage";
import { trackBusiness } from "@/lib/analytics/client";
import type { ProblemCategory } from "@/lib/types";
import { useAuth } from "./AuthProvider";

export default function ProblemForm() {
  const { session } = useAuth();
  const [category, setCategory] = useState<ProblemCategory>("voda");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!description.trim()) {
      setError("Opis problema je obavezan.");
      return;
    }

    if (!session) {
      setError("Morate biti prijavljeni.");
      return;
    }

    addProblem({
      id: generateId(),
      userId: session.userId,
      fullName: session.fullName,
      room: session.room || "",
      category,
      description: description.trim(),
      phone: phone.trim() || undefined,
      status: "Primljeno",
      createdAt: new Date().toISOString(),
    });

    trackBusiness("problem.submit", { category, room: session.room }, "problem.submit", category);

    setSubmitted(true);
    setDescription("");
    setPhone("");
    setCategory("voda");
  }

  if (submitted) {
    return (
      <div className="ht-panel-bordered px-6 py-12 text-center sm:px-10 sm:py-14">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-800">
          <AppIcon name="check" className="h-7 w-7" />
        </div>
        <p className="ht-display text-2xl text-ht-navy">Prijava primljena</p>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ht-muted">
          Evidentirano u sistemu. Održavanje će vas kontaktirati po potrebi.
        </p>
        <Link href="/moje-prijave" className="ht-btn-primary mt-8 inline-flex">
          Pratite status
        </Link>
        <button type="button" onClick={() => setSubmitted(false)} className="ht-btn-secondary mt-3">
          Nova prijava
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="ht-panel-bordered p-6 sm:p-8">
      {session && (
        <div className="mb-6 border-b border-ht-border-light pb-5">
          <p className="ht-label mb-1">Podnosilac</p>
          <p className="font-medium text-ht-navy">{session.fullName}</p>
          {session.room && (
            <p className="text-sm text-ht-muted">Soba {session.room}</p>
          )}
        </div>
      )}

      <div className="mb-5">
        <label htmlFor="category" className="ht-field-label">Kategorija</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ProblemCategory)}
          className="ht-input"
        >
          {PROBLEM_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label htmlFor="description" className="ht-field-label">Opis problema *</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          placeholder="Opišite problem što jasnije..."
          className="ht-input resize-y"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="problem-phone" className="ht-field-label">
          Telefon (opciono)
        </label>
        <input
          id="problem-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+381 6x xxx xxxx"
          className="ht-input"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 border-l-[3px] border-ht-danger bg-ht-danger-bg px-4 py-3 text-base text-ht-danger"
        >
          <AppIcon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button type="submit" className="ht-btn-primary inline-flex w-full items-center justify-center gap-2">
        <AppIcon name="report" className="h-4 w-4" />
        Pošalji prijavu
      </button>
    </form>
  );
}
