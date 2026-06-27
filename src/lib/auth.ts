import {
  DEZURNI_CREDENTIALS,
  STORAGE_KEYS,
  UPRAVNIK_CREDENTIALS,
} from "./constants";
import {
  createPrijemHandover,
  getRoomByNumber,
} from "./rooms";
import {
  addUser,
  generateId,
  getItem,
  getUserByRoom,
  getUsers,
  removeItem,
  roomExists,
  setItem,
} from "./storage";
import type {
  CreateGuestData,
  LoginFormData,
  RegisterFormData,
  Session,
  StaffLoginFormData,
  User,
  UserRole,
} from "./types";

export type RegisterResult =
  | { success: true; pending: true }
  | { success: true; pending?: false }
  | { success: false; error: string };

export type CreateGuestResult =
  | { success: true; user: User; pin: string }
  | { success: false; error: string };

function normalizeRole(role: string): UserRole {
  if (role === "admin") return "upravnik";
  if (
    role === "upravnik" ||
    role === "dezurni" ||
    role === "stanar" ||
    role === "gost"
  ) {
    return role;
  }
  return "stanar";
}

export function getSession(): Session | null {
  const session = getItem<Session | null>(STORAGE_KEYS.SESSION, null);
  if (!session) return null;
  return { ...session, role: normalizeRole(session.role) };
}

export function setSession(session: Session): void {
  setItem(STORAGE_KEYS.SESSION, session);
}

export function clearSession(): void {
  removeItem(STORAGE_KEYS.SESSION);
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function isUpravnik(): boolean {
  return getSession()?.role === "upravnik";
}

export function isDezurni(): boolean {
  return getSession()?.role === "dezurni";
}

export function isStaff(): boolean {
  const role = getSession()?.role;
  return role === "upravnik" || role === "dezurni";
}

export function isStanar(): boolean {
  return getSession()?.role === "stanar";
}

export function isGost(): boolean {
  return getSession()?.role === "gost";
}

export function isResident(): boolean {
  const role = getSession()?.role;
  return role === "stanar" || role === "gost";
}

export function isAdmin(): boolean {
  return isUpravnik();
}

function getUserByRoomAndRole(
  room: string,
  role: "stanar" | "gost"
): User | undefined {
  return getUsers().find(
    (u) => u.room === room.trim() && u.role === role && u.status === "active"
  );
}

function loginResident(
  data: LoginFormData,
  expectedRole: "stanar" | "gost"
): { success: boolean; error?: string } {
  const user = getUserByRoomAndRole(data.room.trim(), expectedRole);

  if (!user) {
    const anyUser = getUserByRoom(data.room.trim());
    if (anyUser && anyUser.role !== expectedRole) {
      return {
        success: false,
        error:
          expectedRole === "gost"
            ? "Ova soba nije dodeljena gostu. Koristite tab Stanar ili kontaktirajte dežurnu službu."
            : "Za ovu sobu koristite tab Gost ili se registrujte.",
      };
    }
    return { success: false, error: "Nalog za ovu sobu nije pronađen." };
  }

  if (user.pin !== data.pin) {
    return { success: false, error: "Pogrešan PIN. Pokušajte ponovo." };
  }

  if (user.status === "pending") {
    return {
      success: false,
      error:
        "Nalog čeka odobrenje upravnika hotela. Prijava će biti moguća nakon odobrenja.",
    };
  }

  if (user.status === "inactive") {
    return {
      success: false,
      error: "Nalog nije aktivan. Javite se dežurnoj službi ili upravi hotela.",
    };
  }

  setSession({
    userId: user.id,
    role: user.role,
    fullName: user.fullName,
    room: user.room,
    loggedInAt: new Date().toISOString(),
  });

  return { success: true };
}

export function loginStanar(data: LoginFormData): { success: boolean; error?: string } {
  return loginResident(data, "stanar");
}

export function loginGost(data: LoginFormData): { success: boolean; error?: string } {
  return loginResident(data, "gost");
}

export function loginUpravnik(
  data: StaffLoginFormData
): { success: boolean; error?: string } {
  if (
    data.username.trim() !== UPRAVNIK_CREDENTIALS.username ||
    data.pin !== UPRAVNIK_CREDENTIALS.pin
  ) {
    return { success: false, error: "Pogrešno korisničko ime ili PIN." };
  }

  setSession({
    userId: "upravnik",
    role: "upravnik",
    fullName: UPRAVNIK_CREDENTIALS.displayName,
    username: UPRAVNIK_CREDENTIALS.username,
    loggedInAt: new Date().toISOString(),
  });

  return { success: true };
}

export function loginAdmin(data: StaffLoginFormData): { success: boolean; error?: string } {
  return loginUpravnik(data);
}

export function loginDezurni(
  data: StaffLoginFormData
): { success: boolean; error?: string } {
  if (
    data.username.trim() !== DEZURNI_CREDENTIALS.username ||
    data.pin !== DEZURNI_CREDENTIALS.pin
  ) {
    return { success: false, error: "Pogrešno korisničko ime ili PIN." };
  }

  setSession({
    userId: "dezurni",
    role: "dezurni",
    fullName: DEZURNI_CREDENTIALS.displayName,
    username: DEZURNI_CREDENTIALS.username,
    loggedInAt: new Date().toISOString(),
  });

  return { success: true };
}

export function registerStanar(data: RegisterFormData): RegisterResult {
  if (!data.firstName.trim()) {
    return { success: false, error: "Ime je obavezno." };
  }
  if (!data.lastName.trim()) {
    return { success: false, error: "Prezime je obavezno." };
  }
  if (!data.room.trim()) {
    return { success: false, error: "Broj sobe je obavezan." };
  }
  if (data.pin.length < 4) {
    return { success: false, error: "PIN mora imati najmanje 4 cifre." };
  }
  if (data.pin !== data.confirmPin) {
    return { success: false, error: "PIN i potvrda PIN-a se ne poklapaju." };
  }
  if (!data.acceptRules) {
    return { success: false, error: "Morate prihvatiti kućni red i pravila." };
  }
  if (roomExists(data.room)) {
    return {
      success: false,
      error:
        "Za ovu sobu već postoji nalog ili zahtev na čekanju. Javite se upravi hotela.",
    };
  }

  const user: User = {
    id: generateId(),
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    fullName: `${data.firstName.trim()} ${data.lastName.trim()}`,
    room: data.room.trim(),
    pin: data.pin,
    phone: data.phone?.trim() || undefined,
    role: "stanar",
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  addUser(user);

  return { success: true, pending: true };
}

export function createGuestAccount(
  data: CreateGuestData,
  createdById: string,
  createdByName: string
): CreateGuestResult {
  if (!data.firstName.trim() || !data.lastName.trim()) {
    return { success: false, error: "Ime i prezime su obavezni." };
  }
  if (!data.room.trim()) {
    return { success: false, error: "Broj sobe je obavezan." };
  }
  if (data.pin.length < 4) {
    return { success: false, error: "PIN mora imati najmanje 4 cifre." };
  }

  const room = getRoomByNumber(data.room);
  if (!room) {
    return { success: false, error: "Soba nije registrovana u sistemu. Kontaktirajte upravnika." };
  }
  if (room.status === "renoviranje") {
    return { success: false, error: "Soba je u renoviranju i nije dostupna." };
  }
  if (room.status === "zauzeta" || room.dodeljeniUserId) {
    return { success: false, error: "Soba je već zauzeta." };
  }

  if (
    getUsers().some(
      (u) =>
        u.room === data.room.trim() &&
        u.status === "active" &&
        (u.role === "gost" || u.role === "stanar")
    )
  ) {
    return { success: false, error: "Za ovu sobu već postoji aktivan nalog." };
  }

  const user: User = {
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

  addUser(user);
  createPrijemHandover(room, user);

  return { success: true, user, pin: data.pin };
}

export function logout(): void {
  clearSession();
}
