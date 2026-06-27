"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  INVENTORY_STATE_LABELS,
  ROOM_CONDITION_LABELS,
  ROOM_OCCUPANCY_LABELS,
  ROOM_PURPOSE_LABELS,
} from "@/lib/constants";
import { createGuestAccount } from "@/lib/auth";
import {
  addRoom,
  confirmPredajaByDezurni,
  confirmPrijemByDezurni,
  createEmptyRoom,
  deleteRoom,
  emptyInventoryItem,
  getHandovers,
  getPendingDezurniHandovers,
  getRooms,
  roomNumberTaken,
  updateRoom,
} from "@/lib/rooms";
import { getUserById } from "@/lib/storage";
import type {
  HotelRoom,
  InventoryItem,
  MeterReading,
  RoomCondition,
  RoomHandover,
  RoomOccupancy,
  RoomPurpose,
} from "@/lib/types";
import { useAuth } from "./AuthProvider";
import EmptyState from "./EmptyState";
import ConfirmDialog from "./ConfirmDialog";
import RoomCreateModal from "./RoomCreateModal";
import HandoverConfirmForm from "./HandoverConfirmForm";
import GuestPinModal from "./GuestPinModal";

type RoomFilter = "all" | "slobodna" | "zauzeta" | "renoviranje";

function minutesAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "upravo sada";
  if (min < 60) return `pre ${min} min`;
  return `pre ${Math.floor(min / 60)}h`;
}

function canDeleteRoom(room: HotelRoom): boolean {
  const activeHandover = getHandovers().some(
    (h) => h.roomId === room.id && h.status !== "zavrseno"
  );
  return room.status === "slobodna" && !activeHandover;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RoomsManagementPanel() {
  const { isUpravnik, isDezurni, session } = useAuth();
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [handovers, setHandovers] = useState<RoomHandover[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestPinModal, setGuestPinModal] = useState<{
    name: string;
    room: string;
    pin: string;
  } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const [activeHandoverId, setActiveHandoverId] = useState<string | null>(null);
  const [roomFilter, setRoomFilter] = useState<RoomFilter>("all");

  const refresh = useCallback(() => {
    setRooms(getRooms());
    setHandovers(getHandovers());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selected = rooms.find((r) => r.id === selectedId);
  const pendingDezurni = getPendingDezurniHandovers();

  const freeGuestRooms = useMemo(
    () =>
      rooms.filter(
        (r) =>
          r.status === "slobodna" &&
          !r.dodeljeniUserId &&
          (r.namena === "gost" || r.namena === "mesovita")
      ),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    if (roomFilter === "all") return rooms;
    if (roomFilter === "renoviranje") {
      return rooms.filter((r) => r.status === "renoviranje" || r.trebaRenoviranje);
    }
    return rooms.filter((r) => r.status === roomFilter);
  }, [rooms, roomFilter]);

  function handleAddRoom(data: { broj: string; sprat: string; namena: RoomPurpose }) {
    if (roomNumberTaken(data.broj)) return;
    const room = {
      ...createEmptyRoom(data.broj),
      sprat: data.sprat,
      namena: data.namena,
    };
    addRoom(room);
    refresh();
    setSelectedId(room.id);
    setShowCreateModal(false);
  }

  function handleDeleteRoom(id: string) {
    const room = rooms.find((r) => r.id === id);
    if (!room || !canDeleteRoom(room)) return;
    deleteRoom(id);
    if (selectedId === id) setSelectedId(null);
    setDeleteRoomId(null);
    refresh();
  }

  function handleDezurniConfirm(h: RoomHandover) {
    if (!session) return;
    if (h.tip === "prijem") {
      confirmPrijemByDezurni(h.id, session.userId, session.fullName);
      setActiveHandoverId(null);
      refresh();
    } else {
      setActiveHandoverId(h.id);
    }
  }

  function handlePredajaConfirm(
    handoverId: string,
    data: { stanje: RoomCondition; zapazanja?: string; primedbe?: string }
  ) {
    if (!session) return;
    confirmPredajaByDezurni(handoverId, {
      authorId: session.userId,
      authorName: session.fullName,
      ...data,
    });
    setActiveHandoverId(null);
    refresh();
  }

  return (
    <div className="space-y-8">
      {pendingDezurni.length > 0 && isDezurni && (
        <section className="ht-panel-bordered border-l-[3px] border-l-ht-gold p-5">
          <h3 className="mb-4 font-semibold text-ht-navy">
            Prijem / predaja — čeka potvrdu ({pendingDezurni.length})
          </h3>
          <div className="space-y-3">
            {pendingDezurni.map((h) => (
              <article key={h.id} className="rounded-lg border border-ht-border border-l-[3px] border-l-ht-gold bg-ht-cream/30 p-4">
                <p className="font-medium text-ht-navy">
                  {h.tip === "prijem" ? "Prijem" : "Predaja"} · Soba {h.brojSobe} · {h.userName}
                </p>
                <p className="text-xs text-ht-muted">
                  {formatDate(h.createdAt)} · {minutesAgo(h.createdAt)}
                </p>
                {activeHandoverId === h.id ? (
                  <HandoverConfirmForm
                    handover={h}
                    onConfirm={(data) => handlePredajaConfirm(h.id, data)}
                    onCancel={() => setActiveHandoverId(null)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDezurniConfirm(h)}
                    className="ht-btn-primary touch-target mt-3 text-sm"
                  >
                    Potvrdi {h.tip === "prijem" ? "prijem" : "predaju"}
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {isDezurni && (
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-ht-navy">Novi gost</h3>
              <p className="text-sm text-ht-muted">
                Dodelite privremeni nalog — gost potvrđuje prijem sobe u aplikaciji.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGuestForm((v) => !v)}
              className="ht-btn-primary text-sm"
            >
              {showGuestForm ? "Zatvori" : "Dodeli gostu pristup"}
            </button>
          </div>
          {showGuestForm && session && (
            <GuestCreateForm
              freeRooms={freeGuestRooms}
              onCreated={(data) => {
                setGuestPinModal(data);
                setShowGuestForm(false);
                refresh();
              }}
              createdById={session.userId}
              createdByName={session.fullName}
            />
          )}
        </section>
      )}

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-ht-navy">
              {isUpravnik ? "Upravljanje sobama" : "Pregled soba"}
            </h3>
            <p className="text-sm text-ht-muted">
              {isUpravnik
                ? "Definišite sobe, inventar, stanje, očitanja i namenu."
                : "Pregled inventara, stanja i dodeljenih korisnika."}
            </p>
          </div>
          {isUpravnik && (
            <button type="button" onClick={() => setShowCreateModal(true)} className="ht-btn-secondary text-sm">
              + Nova soba
            </button>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ["all", "Sve"],
              ["slobodna", "Slobodne"],
              ["zauzeta", "Zauzete"],
              ["renoviranje", "Renoviranje"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRoomFilter(value)}
              className={`ht-filter-chip ${roomFilter === value ? "ht-filter-chip-active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredRooms.length === 0 ? (
          <EmptyState
            icon="bed"
            title="Nema unetih soba"
            description={
              isUpravnik
                ? "Dodajte prvu sobu da biste mogli dodeliti stanare i goste."
                : "Upravnik još nije uneo sobe u sistem."
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              {filteredRooms.map((room) => {
                const occupant = room.dodeljeniUserId
                  ? getUserById(room.dodeljeniUserId)
                  : undefined;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedId(room.id)}
                    className={`ht-panel-bordered w-full p-4 text-left transition-colors ${
                      selectedId === room.id ? "border-ht-gold bg-ht-cream/40" : "hover:bg-ht-cream/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="ht-display text-xl text-ht-navy">Soba {room.broj}</span>
                      <span className="text-xs font-medium text-ht-muted">
                        {ROOM_OCCUPANCY_LABELS[room.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ht-muted">
                      {ROOM_PURPOSE_LABELS[room.namena]} · {ROOM_CONDITION_LABELS[room.stanje]}
                      {room.trebaRenoviranje && " · Renoviranje"}
                    </p>
                    {occupant && (
                      <p className="mt-1 text-xs text-ht-navy">
                        {occupant.fullName} ({occupant.role})
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {selected && (
              <RoomEditor
                room={selected}
                readonly={!isUpravnik}
                onSave={(patch) => {
                  updateRoom(selected.id, patch);
                  refresh();
                }}
                onDelete={
                  isUpravnik && canDeleteRoom(selected)
                    ? () => setDeleteRoomId(selected.id)
                    : undefined
                }
              />
            )}
          </div>
        )}
      </section>

      {isUpravnik && handovers.length > 0 && (
        <section>
          <h3 className="mb-4 text-lg font-semibold text-ht-navy">Evidencija prijema i predaje</h3>
          <div className="overflow-x-auto ht-panel-bordered">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-ht-bg text-ht-muted">
                <tr>
                  <th className="px-3 py-2">Vreme</th>
                  <th className="px-3 py-2">Soba</th>
                  <th className="px-3 py-2">Tip</th>
                  <th className="px-3 py-2">Korisnik</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Napomene dežurnog</th>
                </tr>
              </thead>
              <tbody>
                {handovers.slice(0, 50).map((h) => (
                  <tr key={h.id} className="border-t border-ht-border">
                    <td className="whitespace-nowrap px-3 py-2">{formatDate(h.createdAt)}</td>
                    <td className="px-3 py-2">{h.brojSobe}</td>
                    <td className="px-3 py-2 capitalize">{h.tip}</td>
                    <td className="px-3 py-2">
                      {h.userName} ({h.userRole})
                    </td>
                    <td className="px-3 py-2">{h.status.replace(/_/g, " ")}</td>
                    <td className="px-3 py-2 text-ht-muted">
                      {h.dezurniPotvrda?.zapazanja || h.dezurniPotvrda?.primedbe || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <RoomCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleAddRoom}
      />

      <GuestPinModal
        open={guestPinModal !== null}
        guestName={guestPinModal?.name ?? ""}
        room={guestPinModal?.room ?? ""}
        pin={guestPinModal?.pin ?? ""}
        onClose={() => setGuestPinModal(null)}
      />

      <ConfirmDialog
        open={deleteRoomId !== null}
        title="Obriši sobu"
        message="Obrisati sobu iz evidencije? Moguće je samo za slobodne sobe bez aktivnog prijema/predaje."
        confirmLabel="Obriši"
        danger
        onConfirm={() => deleteRoomId && handleDeleteRoom(deleteRoomId)}
        onCancel={() => setDeleteRoomId(null)}
      />
    </div>
  );
}

function GuestCreateForm({
  freeRooms,
  onCreated,
  createdById,
  createdByName,
}: {
  freeRooms: HotelRoom[];
  onCreated: (data: { name: string; room: string; pin: string }) => void;
  createdById: string;
  createdByName: string;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [room, setRoom] = useState(freeRooms[0]?.broj || "");
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState("");
  const [boravakDo, setBoravakDo] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = createGuestAccount(
      { firstName, lastName, room, pin, phone, boravakDo },
      createdById,
      createdByName
    );
    if (!result.success) {
      setError(result.error);
      return;
    }
    onCreated({
      name: result.user.fullName,
      room: result.user.room,
      pin: result.pin,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="ht-panel-bordered space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="ht-field-label">Ime</label>
          <input className="ht-input w-full" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div>
          <label className="ht-field-label">Prezime</label>
          <input className="ht-input w-full" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="ht-field-label">Soba</label>
          <select className="ht-input w-full" value={room} onChange={(e) => setRoom(e.target.value)} required>
            {freeRooms.length === 0 && <option value="">Nema slobodnih soba</option>}
            {freeRooms.map((r) => (
              <option key={r.id} value={r.broj}>
                {r.broj} — {ROOM_PURPOSE_LABELS[r.namena]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="ht-field-label">PIN (min. 4 cifre)</label>
          <input className="ht-input w-full" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} required minLength={4} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="ht-field-label">Telefon (opciono)</label>
          <input className="ht-input w-full" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="ht-field-label">Boravak do (opciono)</label>
          <input className="ht-input w-full" type="date" value={boravakDo} onChange={(e) => setBoravakDo(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-ht-danger">{error}</p>}
      <button type="submit" className="ht-btn-primary" disabled={freeRooms.length === 0}>
        Kreiraj nalog gosta
      </button>
    </form>
  );
}

function RoomEditor({
  room,
  readonly,
  onSave,
  onDelete,
}: {
  room: HotelRoom;
  readonly: boolean;
  onSave: (patch: Partial<HotelRoom>) => void;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState(room);

  useEffect(() => {
    setDraft(room);
  }, [room]);

  function updateInventory(index: number, patch: Partial<InventoryItem>) {
    const inventar = draft.inventar.map((item, i) =>
      i === index ? { ...item, ...patch } : item
    );
    setDraft({ ...draft, inventar });
  }

  function addInventoryRow() {
    setDraft({ ...draft, inventar: [...draft.inventar, emptyInventoryItem()] });
  }

  function removeInventoryRow(index: number) {
    setDraft({ ...draft, inventar: draft.inventar.filter((_, i) => i !== index) });
  }

  function addMeterReading() {
    const reading: MeterReading = {
      id: crypto.randomUUID?.() || `m-${Date.now()}`,
      tip: "struja",
      vrednost: "",
      jedinica: "kWh",
      datum: new Date().toISOString().slice(0, 10),
    };
    setDraft({ ...draft, ocitanja: [...draft.ocitanja, reading] });
  }

  return (
    <div className="ht-panel-bordered space-y-5 p-5">
      <h4 className="ht-display text-xl text-ht-navy">Soba {draft.broj}</h4>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sprat">
          <input
            className="ht-input w-full"
            value={draft.sprat}
            disabled={readonly}
            onChange={(e) => setDraft({ ...draft, sprat: e.target.value })}
          />
        </Field>
        <Field label="Namena">
          <select
            className="ht-input w-full"
            value={draft.namena}
            disabled={readonly}
            onChange={(e) => setDraft({ ...draft, namena: e.target.value as RoomPurpose })}
          >
            {Object.entries(ROOM_PURPOSE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className="ht-input w-full"
            value={draft.status}
            disabled={readonly}
            onChange={(e) => setDraft({ ...draft, status: e.target.value as RoomOccupancy })}
          >
            {Object.entries(ROOM_OCCUPANCY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Stanje">
          <select
            className="ht-input w-full"
            value={draft.stanje}
            disabled={readonly}
            onChange={(e) => setDraft({ ...draft, stanje: e.target.value as RoomCondition })}
          >
            {Object.entries(ROOM_CONDITION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {!readonly && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.trebaRenoviranje}
            onChange={(e) => setDraft({ ...draft, trebaRenoviranje: e.target.checked })}
          />
          Potrebno renoviranje
        </label>
      )}

      {draft.trebaRenoviranje && (
        <Field label="Napomena o renoviranju">
          <textarea
            className="ht-input w-full min-h-[60px]"
            value={draft.napomenaRenoviranje || ""}
            disabled={readonly}
            onChange={(e) => setDraft({ ...draft, napomenaRenoviranje: e.target.value })}
          />
        </Field>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="ht-label">Inventar</p>
          {!readonly && (
            <button type="button" onClick={addInventoryRow} className="text-sm text-ht-navy underline">
              + Stavka
            </button>
          )}
        </div>
        <div className="space-y-2">
          {draft.inventar.map((item, i) => (
            <div key={item.id} className="flex flex-wrap gap-2">
              <input
                className="ht-input min-w-[120px] flex-1"
                placeholder="Naziv"
                value={item.naziv}
                disabled={readonly}
                onChange={(e) => updateInventory(i, { naziv: e.target.value })}
              />
              <input
                className="ht-input w-16"
                type="number"
                min={0}
                value={item.kolicina}
                disabled={readonly}
                onChange={(e) => updateInventory(i, { kolicina: Number(e.target.value) })}
              />
              <select
                className="ht-input"
                value={item.stanje}
                disabled={readonly}
                onChange={(e) =>
                  updateInventory(i, {
                    stanje: e.target.value as InventoryItem["stanje"],
                  })
                }
              >
                {Object.entries(INVENTORY_STATE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              {!readonly && (
                <button type="button" onClick={() => removeInventoryRow(i)} className="text-ht-danger text-sm">
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {(draft.ocitanja.length > 0 || !readonly) && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="ht-label">Očitanja (struja, voda, grejanje)</p>
            {!readonly && (
              <button type="button" onClick={addMeterReading} className="text-sm text-ht-navy underline">
                + Očitanje
              </button>
            )}
          </div>
          {draft.ocitanja.length === 0 ? (
            <p className="text-sm text-ht-muted">Nema unetih očitanja.</p>
          ) : (
            draft.ocitanja.map((o, i) => (
              <div key={o.id} className="mb-2 flex flex-wrap gap-2 text-sm">
                <select
                  className="ht-input"
                  value={o.tip}
                  disabled={readonly}
                  onChange={(e) => {
                    const ocitanja = [...draft.ocitanja];
                    ocitanja[i] = { ...o, tip: e.target.value as MeterReading["tip"] };
                    setDraft({ ...draft, ocitanja });
                  }}
                >
                  <option value="struja">Struja</option>
                  <option value="voda">Voda</option>
                  <option value="grejanje">Grejanje</option>
                </select>
                <input
                  className="ht-input w-24"
                  value={o.vrednost}
                  disabled={readonly}
                  onChange={(e) => {
                    const ocitanja = [...draft.ocitanja];
                    ocitanja[i] = { ...o, vrednost: e.target.value };
                    setDraft({ ...draft, ocitanja });
                  }}
                />
                <input
                  className="ht-input w-20"
                  value={o.jedinica}
                  disabled={readonly}
                  onChange={(e) => {
                    const ocitanja = [...draft.ocitanja];
                    ocitanja[i] = { ...o, jedinica: e.target.value };
                    setDraft({ ...draft, ocitanja });
                  }}
                />
                <input
                  className="ht-input"
                  type="date"
                  value={o.datum}
                  disabled={readonly}
                  onChange={(e) => {
                    const ocitanja = [...draft.ocitanja];
                    ocitanja[i] = { ...o, datum: e.target.value };
                    setDraft({ ...draft, ocitanja });
                  }}
                />
              </div>
            ))
          )}
        </div>
      )}

      <Field label="Interna napomena (samo uprava)">
        <textarea
          className="ht-input w-full min-h-[60px]"
          value={draft.internaNapomena || ""}
          disabled={readonly}
          onChange={(e) => setDraft({ ...draft, internaNapomena: e.target.value })}
        />
      </Field>

      {!readonly && (
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => onSave(draft)} className="ht-btn-primary">
            Sačuvaj sobu
          </button>
          {onDelete && (
            <button type="button" onClick={onDelete} className="ht-btn-secondary text-ht-danger">
              Obriši
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="ht-field-label">{label}</label>
      {children}
    </div>
  );
}
