import type { UserStatus } from "./types";

export const APP_NAME = "Hotel Topčider";
export const APP_SHORT_NAME = "Topčider";
export const APP_DESCRIPTION =
  "Digitalni servis za stanare i korisnike hotela — obaveštenja, prijave, kontakti i korisne informacije.";

/** Oznaka faze — prezentaciona demo, ne zvanična produkcija */
export const APP_PHASE_LABEL = "Prezentaciona demo verzija";
export const APP_PHASE_NOTICE =
  "Ovo nije zvanična aplikacija hotela. Pristup je ograničen na pozvane učesnike kojima su prosleđeni pristupni podaci.";

export const THEME_COLOR = "#0f2744";
export const BACKGROUND_COLOR = "#f5f6f8";

export const STORAGE_KEYS = {
  USERS: "ht_users",
  PROBLEMS: "ht_problems",
  NOTICES: "ht_notices",
  TASKS: "ht_tasks",
  MESSAGES: "ht_messages",
  SHIFT_LOGS: "ht_shift_logs",
  SESSION: "ht_session",
  ADMIN: "ht_admin_initialized",
  DEMO_VERSION: "ht_demo_version",
  AUDIT_LOGS: "ht_audit_logs",
  ROOMS: "ht_rooms",
  HANDOVERS: "ht_handovers",
} as const;

export const UPRAVNIK_CREDENTIALS = {
  username: "upravnik",
  pin: "0000",
  displayName: "Upravnik hotela",
} as const;

/** @deprecated Koristiti UPRAVNIK_CREDENTIALS */
export const ADMIN_CREDENTIALS = UPRAVNIK_CREDENTIALS;

export const DEZURNI_CREDENTIALS = {
  username: "dezurni",
  pin: "1111",
  displayName: "Dežurna služba",
} as const;

export const PROBLEM_CATEGORIES = [
  { value: "voda", label: "Voda" },
  { value: "struja", label: "Struja" },
  { value: "grejanje", label: "Grejanje" },
  { value: "internet", label: "Internet" },
  { value: "higijena", label: "Higijena" },
  { value: "drugo", label: "Drugo" },
] as const;

export const PROBLEM_STATUSES = ["Primljeno", "U radu", "Rešeno"] as const;

export const USER_STATUSES = [
  { value: "pending", label: "Na čekanju" },
  { value: "active", label: "Odobren" },
  { value: "inactive", label: "Odbijen / neaktivan" },
] as const;

export function getUserStatusLabel(status: UserStatus): string {
  const labels: Record<UserStatus, string> = {
    pending: "Na čekanju",
    active: "Odobren",
    inactive: "Odbijen",
  };
  return labels[status];
}

export const TASK_STATUSES = ["Dodeljen", "U radu", "Izvršen", "Potvrđen"] as const;

export const SHIFT_LOG_TYPES = [
  { value: "zapažanje", label: "Zapažanje" },
  { value: "primedba", label: "Primedba" },
  { value: "info", label: "Informacija" },
] as const;

export const NOTICE_CATEGORIES = [
  { value: "opste", label: "Opšte" },
  { value: "restoran", label: "Restoran / ishrana" },
  { value: "odrzavanje", label: "Održavanje" },
  { value: "bezbednost", label: "Bezbednost" },
  { value: "dogadjaj", label: "Događaj" },
] as const;

export const DAILY_INFO =
  "Dežurna služba i uprava hotela dostupni su 24 sata. Prijave problema mogu se poslati putem aplikacije u bilo koje vreme.";

export const INFO_SECTIONS = [
  {
    id: "kucni-red",
    title: "Kućni red",
    icon: "scroll" as const,
    content:
      "Stanari i korisnici hotela dužni su da poštuju propise smeštajnog objekta, održavaju red i mir u zajedničkim prostorijama te da se pridržavaju radnog vremena restorana i dežurne službe. Ometanje mira u noćnim satima (22:00–06:00) nije dozvoljeno.",
  },
  {
    id: "smestaj",
    title: "Smeštaj i boravak",
    icon: "bed" as const,
    content:
      "Hotel Topčider obezbeđuje uređen smeštaj za stanare i korisnike hotela. Sobe se održavaju prema utvrđenom rasporedu. Za promenu smeštaja ili dodatne potrebe obratite se upravi hotela.",
  },
  {
    id: "higijena",
    title: "Higijena i održavanje",
    icon: "sparkles" as const,
    content:
      "Redovno održavanje i higijena obavljaju se radnim danima od 08:00 do 16:00. Vanredne intervencije mogu se prijaviti putem aplikacije ili dežurne službe. Planirani radovi biće unapred najavljeni putem obaveštenja.",
  },
  {
    id: "internet",
    title: "Internet",
    icon: "wifi" as const,
    content:
      "Wi-Fi mreža dostupna je u celom hotelu. Podatke za pristup možete dobiti putem informacija za stanare. U slučaju problema sa konekcijom, prijavite kvar putem aplikacije.",
  },
  {
    id: "restoran",
    title: "Restoran / ishrana",
    icon: "utensils" as const,
    content:
      "Restoran hotela radi svakog dana od 07:00 do 21:00. Doručak: 07:00–10:00, ručak: 12:00–15:00, večera: 18:00–21:00. Rezervacije se mogu obaviti putem uprave hotela.",
  },
  {
    id: "veseraj",
    title: "Vešeraj",
    icon: "shirt" as const,
    content:
      "Usluga pranja veša dostupna je radnim danima od 08:00 do 16:00. Predaju veša obavite putem dežurne službe. Standardno vreme isporuke je 24–48 sati.",
  },
  {
    id: "dezurna",
    title: "Dežurna služba",
    icon: "clock" as const,
    content:
      "Dežurna služba hotela dostupna je 24 sata dnevno. Za sve informacije, pomoć i vanredne situacije obratite se dežurnoj službi. Kontakt telefon: +381 11 000 0001.",
  },
  {
    id: "prijava-problema",
    title: "Prijava problema",
    icon: "wrench" as const,
    content:
      "Kvarove i probleme u smeštaju možete prijaviti putem aplikacije. Svaka prijava se evidentira i dodeljuje odgovarajućoj službi. Status prijave možete pratiti u odeljku Moje prijave.",
  },
] as const;

export const CONTACTS = [
  {
    id: "uprava",
    title: "Uprava hotela",
    phone: "+381110000000",
    displayPhone: "+381 11 000 0000",
    description: "Opšta pitanja, organizacija boravka i službena komunikacija.",
    icon: "building" as const,
  },
  {
    id: "dezurna",
    title: "Dežurna služba",
    phone: "+381110000001",
    displayPhone: "+381 11 000 0001",
    description: "Dostupnost 24 sata — vanredne situacije i pomoć stanarima.",
    icon: "clock" as const,
  },
  {
    id: "odrzavanje",
    title: "Održavanje",
    phone: "+381110000002",
    displayPhone: "+381 11 000 0002",
    description: "Tehničke intervencije, kvarovi i planirani radovi.",
    icon: "wrench" as const,
  },
  {
    id: "informacije",
    title: "Informacije za stanare",
    phone: "+381110000003",
    displayPhone: "+381 11 000 0003",
    description: "Korisne informacije, radno vreme i uputstva za boravak.",
    icon: "info" as const,
  },
  {
    id: "hitni",
    title: "Hitni brojevi",
    phone: "194",
    displayPhone: "194 — Hitna pomoć",
    description: "Policija: 192 | Hitna pomoć: 194 | Vatrogasci: 193",
    icon: "alert" as const,
  },
] as const;

export const HOTEL_SERVICES = [
  {
    id: "uprava",
    title: "Uprava hotela",
    description: "Službena komunikacija i organizacija",
    href: "/kontakti",
    icon: "building" as const,
  },
  {
    id: "dezurna",
    title: "Dežurna služba",
    description: "Dostupnost 24 sata",
    href: "/kontakti",
    icon: "clock" as const,
  },
  {
    id: "odrzavanje",
    title: "Održavanje",
    description: "Tehničke intervencije i popravke",
    href: "/kontakti",
    icon: "wrench" as const,
  },
  {
    id: "informacije",
    title: "Informacije za stanare",
    description: "Kućni red, boravak i uputstva",
    href: "/informacije",
    icon: "info" as const,
  },
] as const;

export const NAV_ITEMS = [
  { href: "/", label: "Početna", icon: "home" },
  { href: "/obavestenja", label: "Obaveštenja", icon: "bell" },
  { href: "/prijava", label: "Prijava", icon: "report" },
  { href: "/moje-prijave", label: "Prijave", icon: "list" },
  { href: "/informacije", label: "Info", icon: "info" },
] as const;

export const ROOM_OCCUPANCY_LABELS: Record<
  import("./types").RoomOccupancy,
  string
> = {
  slobodna: "Slobodna",
  zauzeta: "Zauzeta",
  renoviranje: "Renoviranje",
};

export const ROOM_CONDITION_LABELS: Record<
  import("./types").RoomCondition,
  string
> = {
  odlicno: "Odlično",
  dobro: "Dobro",
  zadovoljavajuce: "Zadovoljavajuće",
  potrebno_obnavljanje: "Potrebno obnavljanje",
};

export const ROOM_PURPOSE_LABELS: Record<import("./types").RoomPurpose, string> = {
  stanar: "Stanar",
  gost: "Gost",
  mesovita: "Mešovita",
  sluzbena: "Službena",
};

export const INVENTORY_STATE_LABELS: Record<
  import("./types").InventoryItemState,
  string
> = {
  ispravno: "Ispravno",
  osteceno: "Oštećeno",
  nedostaje: "Nedostaje",
};
