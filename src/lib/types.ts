export type UserRole = "stanar" | "upravnik" | "dezurni" | "gost";

export type UserStatus = "pending" | "active" | "inactive";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  room: string;
  pin: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  status: UserStatus;
  /** Gost — ko je kreirao nalog (dežurni) */
  createdById?: string;
  createdByName?: string;
  /** Gost — planirani kraj boravka */
  boravakDo?: string;
}

export interface Session {
  userId: string;
  role: UserRole;
  fullName: string;
  room?: string;
  username?: string;
  loggedInAt: string;
}

export type NoticePriority = "hitno" | "obicno";

export type NoticeCategory =
  | "opste"
  | "restoran"
  | "odrzavanje"
  | "bezbednost"
  | "dogadjaj";

export interface Notice {
  id: string;
  naslov: string;
  datum: string;
  kategorija: NoticeCategory;
  tekst: string;
  prioritet: NoticePriority;
  /** Aktuelna obaveštenja vide stanari; arhiva samo uprava */
  aktivno: boolean;
  createdAt: string;
}

export type ProblemCategory =
  | "voda"
  | "struja"
  | "grejanje"
  | "internet"
  | "higijena"
  | "drugo";

export type ProblemStatus = "Primljeno" | "U radu" | "Rešeno";

export interface DezurniPotvrda {
  preduzeteMere: boolean;
  napomena?: string;
  confirmedAt: string;
  confirmedBy: string;
}

export interface ProblemReport {
  id: string;
  userId: string;
  fullName: string;
  room: string;
  category: ProblemCategory;
  description: string;
  phone?: string;
  status: ProblemStatus;
  createdAt: string;
  dezurniPotvrda?: DezurniPotvrda;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  room: string;
  pin: string;
  confirmPin: string;
  phone?: string;
  acceptRules: boolean;
}

export interface LoginFormData {
  room: string;
  pin: string;
}

export interface StaffLoginFormData {
  username: string;
  pin: string;
}

export interface ProblemFormData {
  category: ProblemCategory;
  description: string;
  phone?: string;
}

/** Zadatak upravnika dežurnoj službi */
export type TaskPriority = "hitno" | "obicno";
export type TaskStatus = "Dodeljen" | "U radu" | "Izvršen" | "Potvrđen";

export interface TaskObservation {
  id: string;
  tekst: string;
  createdAt: string;
  authorName: string;
}

export interface TaskCompletion {
  izvrseno: boolean;
  napomena?: string;
  confirmedAt: string;
  confirmedBy: string;
}

export interface HotelTask {
  id: string;
  naslov: string;
  opis: string;
  prioritet: TaskPriority;
  status: TaskStatus;
  createdById: string;
  createdByName: string;
  createdAt: string;
  rok?: string;
  zapazanja: TaskObservation[];
  izvrsenje?: TaskCompletion;
}

/** Direktna poruka između uloga */
export type MessagePartyRole = UserRole;

export interface Message {
  id: string;
  fromUserId: string;
  fromRole: MessagePartyRole;
  fromName: string;
  fromRoom?: string;
  toUserId: string;
  toRole: MessagePartyRole;
  toName: string;
  naslov: string;
  tekst: string;
  createdAt: string;
  procitanoAt?: string;
}

/** Dežurni zapis smene — zapažanja i primedbe */
export type ShiftLogType = "zapažanje" | "primedba" | "info";

export interface ShiftLog {
  id: string;
  tip: ShiftLogType;
  tekst: string;
  createdAt: string;
  authorId: string;
  authorName: string;
}

/** Fiksni ID-jevi službenih naloga */
export const STAFF_IDS = {
  UPRAVNIK: "upravnik",
  DEZURNI: "dezurni",
} as const;

export type RoomOccupancy = "slobodna" | "zauzeta" | "renoviranje";
export type RoomCondition = "odlicno" | "dobro" | "zadovoljavajuce" | "potrebno_obnavljanje";
export type RoomPurpose = "stanar" | "gost" | "mesovita" | "sluzbena";
export type InventoryItemState = "ispravno" | "osteceno" | "nedostaje";
export type HandoverType = "prijem" | "predaja";
export type HandoverStatus = "ceka_korisnika" | "ceka_dezurnog" | "zavrseno";

export interface InventoryItem {
  id: string;
  naziv: string;
  kolicina: number;
  stanje: InventoryItemState;
}

export interface MeterReading {
  id: string;
  tip: "struja" | "voda" | "grejanje";
  vrednost: string;
  jedinica: string;
  datum: string;
}

export interface HotelRoom {
  id: string;
  broj: string;
  sprat: string;
  namena: RoomPurpose;
  status: RoomOccupancy;
  stanje: RoomCondition;
  trebaRenoviranje: boolean;
  napomenaRenoviranje?: string;
  inventar: InventoryItem[];
  ocitanja: MeterReading[];
  dodeljeniUserId?: string;
  internaNapomena?: string;
  updatedAt: string;
  createdAt: string;
}

export interface RoomHandover {
  id: string;
  roomId: string;
  brojSobe: string;
  tip: HandoverType;
  userId: string;
  userName: string;
  userRole: "stanar" | "gost";
  inventar: InventoryItem[];
  stanjeSobe: RoomCondition;
  korisnikPotvrdio: boolean;
  korisnikPotvrdioAt?: string;
  dezurniPotvrda?: {
    authorId: string;
    authorName: string;
    stanje: RoomCondition;
    zapazanja?: string;
    primedbe?: string;
    confirmedAt: string;
  };
  status: HandoverStatus;
  createdAt: string;
}

export interface CreateGuestData {
  firstName: string;
  lastName: string;
  room: string;
  pin: string;
  phone?: string;
  boravakDo?: string;
}
