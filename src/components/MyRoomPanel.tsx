"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  INVENTORY_STATE_LABELS,
  ROOM_CONDITION_LABELS,
} from "@/lib/constants";
import {
  confirmPredajaByUser,
  confirmPrijemByUser,
  createPrijemHandover,
  createPredajaHandover,
  getActiveHandoverForUser,
  getHandovers,
  getRoomByNumber,
  userHasCompletedPrijem,
} from "@/lib/rooms";
import { getUserById } from "@/lib/storage";
import type { HotelRoom, RoomHandover, User } from "@/lib/types";
import { AppIcon } from "@/lib/icons";
import { useAuth } from "./AuthProvider";
import StepGuide, { type StepItem } from "./StepGuide";

function checkoutStorageKey(userId: string): string {
  return `ht_checkout_done_${userId}`;
}

function InventoryList({ items }: { items: HotelRoom["inventar"] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-ht-muted">Inventar sobe još nije unet od strane uprave.</p>
    );
  }

  return (
    <ul className="divide-y divide-ht-border">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between py-3 text-sm">
          <span className="font-medium text-ht-navy">{item.naziv}</span>
          <span className="text-ht-muted">
            {item.kolicina} · {INVENTORY_STATE_LABELS[item.stanje]}
          </span>
        </li>
      ))}
    </ul>
  );
}

function formatBoravak(iso: string): string {
  return new Date(iso).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function RoomHeader({
  room,
  user,
  isGost,
  completedPrijem,
  handover,
}: {
  room: HotelRoom;
  user?: User;
  isGost: boolean;
  completedPrijem: boolean;
  handover: RoomHandover | null;
}) {
  return (
    <div className="ht-panel-bordered p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="ht-label mb-1">Vaša soba</p>
          <h2 className="ht-display text-3xl text-ht-navy">Soba {room.broj}</h2>
          <p className="mt-1 text-sm text-ht-muted">
            Sprat {room.sprat} · Stanje: {ROOM_CONDITION_LABELS[room.stanje]}
          </p>
          {isGost && (
            <p className="mt-2 text-xs text-ht-muted">Privremeni boravak — gost hotela</p>
          )}
          {!isGost && completedPrijem && (
            <p className="mt-2 text-xs text-ht-muted">Stalni smeštaj — stanar hotela</p>
          )}
          {isGost && user?.boravakDo && (
            <p className="mt-2 text-sm text-ht-navy">
              Boravak do: <strong>{formatBoravak(user.boravakDo)}</strong>
            </p>
          )}
        </div>
        {completedPrijem && !handover && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            <AppIcon name="check" className="h-3.5 w-3.5" />
            Prijem potvrđen
          </span>
        )}
      </div>
    </div>
  );
}

function HandoverSections({
  handover,
  message,
  onConfirmPrijem,
  onConfirmPredaja,
}: {
  handover: RoomHandover | null;
  message: string;
  onConfirmPrijem: () => void;
  onConfirmPredaja: () => void;
}) {
  const isPredaja = handover?.tip === "predaja";
  const isPrijem = handover?.tip === "prijem";

  return (
    <>
      {message && (
        <p className="rounded-lg border border-ht-border-light bg-ht-cream/50 px-4 py-3 text-sm text-ht-navy">
          {message}
        </p>
      )}

      {handover && handover.status === "ceka_korisnika" && isPrijem && (
        <section className="ht-panel-bordered space-y-4 p-6">
          <h3 className="text-lg font-semibold text-ht-navy">Potvrda prijema sobe</h3>
          <p className="text-sm text-ht-muted">
            Pregledajte inventar i stanje sobe pre prijema. Ako se slažete, potvrdite prijem.
          </p>
          <InventoryList items={handover.inventar} />
          <p className="text-sm">
            <span className="font-medium text-ht-navy">Stanje sobe: </span>
            {ROOM_CONDITION_LABELS[handover.stanjeSobe]}
          </p>
          <button type="button" onClick={onConfirmPrijem} className="ht-btn-primary touch-target">
            Potvrđujem prijem sobe
          </button>
        </section>
      )}

      {handover && handover.status === "ceka_dezurnog" && (
        <section className="ht-panel-bordered p-6">
          <h3 className="text-lg font-semibold text-ht-navy">
            {isPrijem ? "Prijem" : "Predaja"} — čeka dežurnu službu
          </h3>
          <p className="mt-2 text-sm text-ht-muted">
            Vaša potvrda je zabeležena. Dežurni će završiti evidenciju u sistemu.
          </p>
        </section>
      )}

      {handover && handover.status === "ceka_korisnika" && isPredaja && (
        <section className="ht-panel-bordered space-y-4 p-6">
          <h3 className="text-lg font-semibold text-ht-navy">Predaja sobe</h3>
          <p className="text-sm text-ht-muted">
            Proverite inventar i potvrdite da predajete sobu u navedenom stanju.
          </p>
          <InventoryList items={handover.inventar} />
          <p className="text-sm">
            <span className="font-medium text-ht-navy">Stanje sobe: </span>
            {ROOM_CONDITION_LABELS[handover.stanjeSobe]}
          </p>
          <button type="button" onClick={onConfirmPredaja} className="ht-btn-primary touch-target">
            Potvrđujem predaju sobe
          </button>
        </section>
      )}
    </>
  );
}

export function getGostHomeGuideSteps(
  userId: string,
  roomId: string
): StepItem[] {
  const completedPrijem = userHasCompletedPrijem(userId, roomId);
  const handover = getActiveHandoverForUser(userId);
  const checkoutDone =
    typeof window !== "undefined" &&
    sessionStorage.getItem(checkoutStorageKey(userId)) === "1";

  return [
    {
      label: "Pregled inventara",
      description: "Proverite sobu pre prijema",
      done: completedPrijem || !!handover,
      active: !completedPrijem && !handover,
    },
    {
      label: "Potvrda prijema",
      description: "Potvrdite u aplikaciji",
      done: completedPrijem,
      active: handover?.tip === "prijem" && handover.status === "ceka_korisnika",
    },
    {
      label: "Predaja pri odlasku",
      description: "Na kraju boravka",
      done: checkoutDone,
      active: handover?.tip === "predaja" && handover.status === "ceka_korisnika",
    },
  ];
}

function GostRoomFlow({
  session,
  room,
  user,
  logout,
}: {
  session: NonNullable<ReturnType<typeof useAuth>["session"]>;
  room: HotelRoom;
  user?: User;
  logout: () => void;
}) {
  const [handover, setHandover] = useState<RoomHandover | null>(null);
  const [message, setMessage] = useState("");
  const [checkoutDone, setCheckoutDone] = useState(false);

  const refresh = useCallback(() => {
    let active = getActiveHandoverForUser(session.userId);

    if (!active && !userHasCompletedPrijem(session.userId, room.id)) {
      const u = getUserById(session.userId);
      if (u) active = createPrijemHandover(room, u);
    }

    setHandover(active ?? null);

    const stored = sessionStorage.getItem(checkoutStorageKey(session.userId));
    if (stored === "1") {
      setCheckoutDone(true);
      return;
    }

    const lastPredaja = getHandovers()
      .filter(
        (h) =>
          h.userId === session.userId &&
          h.tip === "predaja" &&
          h.status === "zavrseno"
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    if (lastPredaja && !getActiveHandoverForUser(session.userId)) {
      sessionStorage.setItem(checkoutStorageKey(session.userId), "1");
      setCheckoutDone(true);
    }
  }, [session.userId, room]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const completedPrijem = userHasCompletedPrijem(session.userId, room.id);

  const guideSteps = useMemo((): StepItem[] => {
    const predajaActive = handover?.tip === "predaja";
    return [
      {
        label: "Pregled inventara i stanja",
        description: "Proverite listu i stanje sobe",
        done: completedPrijem || !!handover,
        active: !completedPrijem && !handover,
      },
      {
        label: "Potvrda prijema",
        description: "Potvrdite prijem u aplikaciji",
        done: completedPrijem,
        active: handover?.tip === "prijem" && handover.status === "ceka_korisnika",
      },
      {
        label: "Predaja sobe",
        description: "Na kraju boravka — odjava",
        done: checkoutDone,
        active: predajaActive && handover?.status === "ceka_korisnika",
      },
    ];
  }, [handover, completedPrijem, checkoutDone]);

  function handleConfirmPrijem() {
    if (!handover) return;
    confirmPrijemByUser(handover.id);
    setMessage("Prijem sobe je potvrđen. Dežurna služba će završiti evidenciju.");
    refresh();
  }

  function handleStartPredaja() {
    const u = getUserById(session.userId);
    if (!u) return;
    const result = createPredajaHandover(room, u);
    if ("error" in result) {
      setMessage(result.error);
      return;
    }
    setMessage("Pregledajte inventar i potvrdite predaju sobe.");
    refresh();
  }

  function handleConfirmPredaja() {
    if (!handover) return;
    confirmPredajaByUser(handover.id);
    setMessage("Predaja je poslata dežurnoj službi na potvrdu.");
    refresh();
  }

  function handleLogout() {
    sessionStorage.removeItem(checkoutStorageKey(session.userId));
    logout();
  }

  if (checkoutDone) {
    return (
      <div className="ht-panel-bordered space-y-6 p-8 text-center">
        <AppIcon name="check" className="mx-auto h-12 w-12 text-emerald-600" />
        <h2 className="ht-display text-2xl text-ht-navy">Predaja završena</h2>
        <p className="text-sm text-ht-muted">Hvala na boravku u hotelu Topčider.</p>
        <button type="button" onClick={handleLogout} className="ht-btn-primary">
          Odjava
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StepGuide title="Vaš boravak — koraci" steps={guideSteps} />
      <RoomHeader
        room={room}
        user={user}
        isGost
        completedPrijem={completedPrijem}
        handover={handover}
      />
      <HandoverSections
        handover={handover}
        message={message}
        onConfirmPrijem={handleConfirmPrijem}
        onConfirmPredaja={handleConfirmPredaja}
      />
      {completedPrijem && !handover && (
        <section className="ht-panel-bordered space-y-4 p-6">
          <h3 className="text-lg font-semibold text-ht-navy">Inventar sobe</h3>
          <InventoryList items={room.inventar} />
          <button type="button" onClick={handleStartPredaja} className="ht-btn-primary touch-target">
            Predaj sobu (odjava)
          </button>
        </section>
      )}
    </div>
  );
}

function StanarRoomView({
  session,
  room,
}: {
  session: NonNullable<ReturnType<typeof useAuth>["session"]>;
  room: HotelRoom;
}) {
  const [handover, setHandover] = useState<RoomHandover | null>(null);
  const [message, setMessage] = useState("");
  const [showPredaja, setShowPredaja] = useState(false);

  const refresh = useCallback(() => {
    let active = getActiveHandoverForUser(session.userId);

    if (!active && !userHasCompletedPrijem(session.userId, room.id)) {
      const u = getUserById(session.userId);
      if (u) active = createPrijemHandover(room, u);
    }

    setHandover(active ?? null);
  }, [session.userId, room]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const completedPrijem = userHasCompletedPrijem(session.userId, room.id);

  const guideSteps = useMemo((): StepItem[] => {
    if (completedPrijem) return [];
    return [
      {
        label: "Pregled inventara i stanja",
        description: "Proverite listu i stanje sobe",
        done: !!handover,
        active: !handover,
      },
      {
        label: "Potvrda prijema",
        description: "Jednokratno pri useljenju",
        done: completedPrijem,
        active: handover?.tip === "prijem" && handover.status === "ceka_korisnika",
      },
    ];
  }, [handover, completedPrijem]);

  function handleConfirmPrijem() {
    if (!handover) return;
    confirmPrijemByUser(handover.id);
    setMessage("Prijem sobe je potvrđen. Dežurna služba će završiti evidenciju.");
    refresh();
  }

  function handleStartPredaja() {
    const u = getUserById(session.userId);
    if (!u) return;
    const result = createPredajaHandover(room, u);
    if ("error" in result) {
      setMessage(result.error);
      return;
    }
    setShowPredaja(true);
    setMessage("Pregledajte inventar i potvrdite predaju sobe.");
    refresh();
  }

  function handleConfirmPredaja() {
    if (!handover) return;
    confirmPredajaByUser(handover.id);
    setMessage("Predaja je poslata dežurnoj službi na potvrdu.");
    refresh();
  }

  const isPredajaFlow = handover?.tip === "predaja";

  return (
    <div className="space-y-6">
      {!completedPrijem && guideSteps.length > 0 && (
        <StepGuide title="Useljenje — koraci" steps={guideSteps} />
      )}
      <RoomHeader
        room={room}
        isGost={false}
        completedPrijem={completedPrijem}
        handover={handover}
      />
      <HandoverSections
        handover={handover}
        message={message}
        onConfirmPrijem={handleConfirmPrijem}
        onConfirmPredaja={handleConfirmPredaja}
      />
      {completedPrijem && !handover && (
        <section className="ht-panel-bordered space-y-4 p-6">
          <h3 className="text-lg font-semibold text-ht-navy">Inventar i stanje</h3>
          <InventoryList items={room.inventar} />
          <p className="text-sm text-ht-muted">
            Stanje sobe: {ROOM_CONDITION_LABELS[room.stanje]}
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm font-medium text-ht-navy underline underline-offset-2">
              Napuštate smeštaj?
            </summary>
            <div className="mt-4 border-t border-ht-border-light pt-4">
              <p className="mb-3 text-sm text-ht-muted">
                Predaja sobe pri selidbi ili odlasku iz hotela — retka operacija.
              </p>
              {!showPredaja && !isPredajaFlow && (
                <button
                  type="button"
                  onClick={handleStartPredaja}
                  className="ht-btn-secondary touch-target text-sm"
                >
                  Započni predaju sobe
                </button>
              )}
            </div>
          </details>
        </section>
      )}
    </div>
  );
}

export default function MyRoomPanel() {
  const { session, isGost, logout } = useAuth();
  const [room, setRoom] = useState<HotelRoom | null>(null);

  useEffect(() => {
    if (!session?.room) {
      setRoom(null);
      return;
    }
    setRoom(getRoomByNumber(session.room) ?? null);
  }, [session?.room]);

  if (!session?.room) {
    return (
      <EmptyState
        title="Soba nije dodeljena"
        description="Kontaktirajte dežurnu službu ili upravu hotela."
      />
    );
  }

  if (!room) {
    return (
      <EmptyState
        title={`Soba ${session.room}`}
        description="Podaci o sobi još nisu uneti u sistem. Javite se upravi hotela."
      />
    );
  }

  const user = getUserById(session.userId);

  if (isGost) {
    return (
      <GostRoomFlow session={session} room={room} user={user} logout={logout} />
    );
  }

  return <StanarRoomView session={session} room={room} />;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="ht-panel-bordered p-8 text-center">
      <AppIcon name="bed" className="mx-auto mb-3 h-8 w-8 text-ht-muted" />
      <h3 className="ht-display text-xl text-ht-navy">{title}</h3>
      <p className="mt-2 text-sm text-ht-muted">{description}</p>
    </div>
  );
}
