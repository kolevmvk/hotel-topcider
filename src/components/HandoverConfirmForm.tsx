"use client";

import { useState } from "react";
import { ROOM_CONDITION_LABELS } from "@/lib/constants";
import type { RoomCondition, RoomHandover } from "@/lib/types";

interface HandoverConfirmFormProps {
  handover: RoomHandover;
  onConfirm: (data: {
    stanje: RoomCondition;
    zapazanja?: string;
    primedbe?: string;
  }) => void;
  onCancel: () => void;
}

export default function HandoverConfirmForm({
  handover,
  onConfirm,
  onCancel,
}: HandoverConfirmFormProps) {
  const [stanje, setStanje] = useState<RoomCondition>(handover.stanjeSobe);
  const [zapazanja, setZapazanja] = useState("");
  const [primedbe, setPrimedbe] = useState("");

  const isPredaja = handover.tip === "predaja";

  return (
    <div className="ht-panel-bordered space-y-4 p-5">
      <h3 className="text-lg font-semibold text-ht-navy">
        Potvrda {isPredaja ? "predaje" : "prijema"} — soba {handover.brojSobe}
      </h3>
      <p className="text-sm text-ht-muted">
        {handover.userName} ({handover.userRole}) ·{" "}
        {handover.korisnikPotvrdio ? "Korisnik potvrdio" : "Čeka korisnika"}
      </p>

      {isPredaja && (
        <>
          <div>
            <label htmlFor="handover-stanje" className="ht-field-label">Stanje sobe</label>
            <select
              id="handover-stanje"
              value={stanje}
              onChange={(e) => setStanje(e.target.value as RoomCondition)}
              className="ht-input w-full"
            >
              {Object.entries(ROOM_CONDITION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="handover-zapazanja" className="ht-field-label">Zapažanja</label>
            <textarea
              id="handover-zapazanja"
              value={zapazanja}
              onChange={(e) => setZapazanja(e.target.value)}
              className="ht-input min-h-[72px] w-full"
              placeholder="Opciono"
            />
          </div>
          <div>
            <label htmlFor="handover-primedbe" className="ht-field-label">Primedbe</label>
            <textarea
              id="handover-primedbe"
              value={primedbe}
              onChange={(e) => setPrimedbe(e.target.value)}
              className="ht-input min-h-[72px] w-full"
              placeholder="Opciono"
            />
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onCancel} className="ht-btn-secondary">Otkaži</button>
        <button
          type="button"
          onClick={() =>
            onConfirm({
              stanje,
              zapazanja: zapazanja.trim() || undefined,
              primedbe: primedbe.trim() || undefined,
            })
          }
          className="ht-btn-primary"
        >
          Potvrdi {isPredaja ? "predaju" : "prijem"}
        </button>
      </div>
    </div>
  );
}
