import { STORAGE_KEYS } from "./constants";
import { generateId, getItem, setItem } from "./storage";
import type {
  CreateGuestData,
  HotelRoom,
  InventoryItem,
  RoomCondition,
  RoomHandover,
  User,
} from "./types";

export function getRooms(): HotelRoom[] {
  return getItem<HotelRoom[]>(STORAGE_KEYS.ROOMS, []);
}

export function saveRooms(rooms: HotelRoom[]): void {
  setItem(STORAGE_KEYS.ROOMS, rooms);
}

export function getRoomById(id: string): HotelRoom | undefined {
  return getRooms().find((r) => r.id === id);
}

export function getRoomByNumber(broj: string): HotelRoom | undefined {
  return getRooms().find((r) => r.broj === broj.trim());
}

export function addRoom(room: HotelRoom): void {
  saveRooms([...getRooms(), room]);
}

export function updateRoom(id: string, patch: Partial<HotelRoom>): void {
  saveRooms(
    getRooms().map((r) =>
      r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r
    )
  );
}

export function deleteRoom(id: string): void {
  saveRooms(getRooms().filter((r) => r.id !== id));
}

export function roomNumberTaken(broj: string, excludeId?: string): boolean {
  return getRooms().some((r) => r.broj === broj.trim() && r.id !== excludeId);
}

export function getHandovers(): RoomHandover[] {
  return getItem<RoomHandover[]>(STORAGE_KEYS.HANDOVERS, []);
}

export function saveHandovers(handovers: RoomHandover[]): void {
  setItem(STORAGE_KEYS.HANDOVERS, handovers);
}

export function addHandover(handover: RoomHandover): void {
  saveHandovers([handover, ...getHandovers()]);
}

export function updateHandover(id: string, patch: Partial<RoomHandover>): void {
  saveHandovers(getHandovers().map((h) => (h.id === id ? { ...h, ...patch } : h)));
}

export function getHandoverById(id: string): RoomHandover | undefined {
  return getHandovers().find((h) => h.id === id);
}

export function getActiveHandoverForUser(userId: string): RoomHandover | undefined {
  return getHandovers().find(
    (h) => h.userId === userId && h.status !== "zavrseno"
  );
}

export function getPendingDezurniHandovers(): RoomHandover[] {
  return getHandovers().filter((h) => h.status === "ceka_dezurnog");
}

export function createPrijemHandover(room: HotelRoom, user: User): RoomHandover {
  const handover: RoomHandover = {
    id: generateId(),
    roomId: room.id,
    brojSobe: room.broj,
    tip: "prijem",
    userId: user.id,
    userName: user.fullName,
    userRole: user.role === "gost" ? "gost" : "stanar",
    inventar: room.inventar.map((i) => ({ ...i })),
    stanjeSobe: room.stanje,
    korisnikPotvrdio: false,
    status: "ceka_korisnika",
    createdAt: new Date().toISOString(),
  };
  addHandover(handover);
  return handover;
}

export function confirmPrijemByUser(handoverId: string): void {
  updateHandover(handoverId, {
    korisnikPotvrdio: true,
    korisnikPotvrdioAt: new Date().toISOString(),
    status: "ceka_dezurnog",
  });
}

export function confirmPrijemByDezurni(
  handoverId: string,
  authorId: string,
  authorName: string
): void {
  const handover = getHandoverById(handoverId);
  if (!handover) return;

  updateHandover(handoverId, {
    status: "zavrseno",
    dezurniPotvrda: {
      authorId,
      authorName,
      stanje: handover.stanjeSobe,
      confirmedAt: new Date().toISOString(),
    },
  });

  updateRoom(handover.roomId, {
    status: "zauzeta",
    dodeljeniUserId: handover.userId,
  });
}

export function createPredajaHandover(
  room: HotelRoom,
  user: User
): RoomHandover | { error: string } {
  if (getActiveHandoverForUser(user.id)) {
    return { error: "Već postoji aktivna predaja ili prijem u toku." };
  }

  const handover: RoomHandover = {
    id: generateId(),
    roomId: room.id,
    brojSobe: room.broj,
    tip: "predaja",
    userId: user.id,
    userName: user.fullName,
    userRole: user.role === "gost" ? "gost" : "stanar",
    inventar: room.inventar.map((i) => ({ ...i })),
    stanjeSobe: room.stanje,
    korisnikPotvrdio: false,
    status: "ceka_korisnika",
    createdAt: new Date().toISOString(),
  };
  addHandover(handover);
  return handover;
}

export function confirmPredajaByUser(handoverId: string): void {
  updateHandover(handoverId, {
    korisnikPotvrdio: true,
    korisnikPotvrdioAt: new Date().toISOString(),
    status: "ceka_dezurnog",
  });
}

export function confirmPredajaByDezurni(
  handoverId: string,
  data: {
    authorId: string;
    authorName: string;
    stanje: RoomCondition;
    zapazanja?: string;
    primedbe?: string;
  }
): void {
  const handover = getHandoverById(handoverId);
  if (!handover) return;

  updateHandover(handoverId, {
    status: "zavrseno",
    dezurniPotvrda: {
      authorId: data.authorId,
      authorName: data.authorName,
      stanje: data.stanje,
      zapazanja: data.zapazanja,
      primedbe: data.primedbe,
      confirmedAt: new Date().toISOString(),
    },
  });

  updateRoom(handover.roomId, {
    status: "slobodna",
    stanje: data.stanje,
    dodeljeniUserId: undefined,
  });
}

export function userHasCompletedPrijem(userId: string, roomId: string): boolean {
  return getHandovers().some(
    (h) =>
      h.userId === userId &&
      h.roomId === roomId &&
      h.tip === "prijem" &&
      h.status === "zavrseno"
  );
}

export function emptyInventoryItem(): InventoryItem {
  return { id: generateId(), naziv: "", kolicina: 1, stanje: "ispravno" };
}

export function createEmptyRoom(broj: string): HotelRoom {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    broj: broj.trim(),
    sprat: broj.trim().charAt(0) || "0",
    namena: "mesovita",
    status: "slobodna",
    stanje: "dobro",
    trebaRenoviranje: false,
    inventar: [],
    ocitanja: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function buildGuestUser(
  data: CreateGuestData,
  createdById: string,
  createdByName: string
): User {
  return {
    id: generateId(),
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    fullName: `${data.firstName.trim()} ${data.lastName.trim()}`,
    room: data.room.trim(),
    pin: data.pin,
    phone: data.phone?.trim() || undefined,
    role: "gost",
    status: "active",
    createdAt: new Date().toISOString(),
    createdById,
    createdByName,
    boravakDo: data.boravakDo || undefined,
  };
}
