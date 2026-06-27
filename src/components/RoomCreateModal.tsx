"use client";

import { useEffect } from "react";
import { ROOM_PURPOSE_LABELS } from "@/lib/constants";
import type { RoomPurpose } from "@/lib/types";

interface RoomCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { broj: string; sprat: string; namena: RoomPurpose }) => void;
  error?: string;
}

export default function RoomCreateModal({
  open,
  onClose,
  onSubmit,
  error,
}: RoomCreateModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      broj: String(fd.get("broj") ?? "").trim(),
      sprat: String(fd.get("sprat") ?? "").trim(),
      namena: String(fd.get("namena") ?? "mesovita") as RoomPurpose,
    });
  }

  return (
    <div className="ht-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="ht-modal" role="dialog" aria-labelledby="room-create-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="room-create-title" className="ht-display text-xl text-ht-navy">
          Nova soba
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="room-broj" className="ht-field-label">Broj sobe</label>
            <input id="room-broj" name="broj" required className="ht-input w-full" placeholder="npr. 401" />
          </div>
          <div>
            <label htmlFor="room-sprat" className="ht-field-label">Sprat</label>
            <input id="room-sprat" name="sprat" required className="ht-input w-full" placeholder="npr. 4" />
          </div>
          <div>
            <label htmlFor="room-namena" className="ht-field-label">Namena</label>
            <select id="room-namena" name="namena" className="ht-input w-full" defaultValue="mesovita">
              {Object.entries(ROOM_PURPOSE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-ht-danger">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="ht-btn-secondary flex-1">Otkaži</button>
            <button type="submit" className="ht-btn-primary flex-1">Dodaj sobu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
