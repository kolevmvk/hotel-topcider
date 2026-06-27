import type { IconName } from "./icons";
import { userNeedsRoomCheckIn } from "./dashboard";
import { getNotices } from "./storage";
import type { Session, UserRole } from "./types";

export interface HomeAction {
  title: string;
  description: string;
  href: string;
  icon: IconName;
  variant: "default" | "urgent" | "gold";
}

function urgentNoticeAction(): HomeAction | null {
  const urgent = getNotices().find((n) => n.aktivno && n.prioritet === "hitno");
  if (!urgent) return null;
  return {
    title: "Hitno obaveštenje",
    description: urgent.naslov,
    href: "/obavestenja",
    icon: "bell",
    variant: "urgent",
  };
}

function reportProblemAction(): HomeAction {
  return {
    title: "Prijavi problem",
    description: "Evidentirajte kvar ili problem u smeštaju jednim tapom.",
    href: "/prijava",
    icon: "report",
    variant: "default",
  };
}

function checkInAction(): HomeAction {
  return {
    title: "Potvrdite prijem sobe",
    description: "Pregledajte inventar i potvrdite prijem pre nego što nastavite.",
    href: "/soba",
    icon: "bed",
    variant: "gold",
  };
}

export function getHomeAction(session: Session, role: UserRole): HomeAction | null {
  if (role !== "stanar" && role !== "gost") return null;

  const needsCheckIn = userNeedsRoomCheckIn(session);

  if (role === "gost") {
    if (needsCheckIn) return checkInAction();
    const urgent = urgentNoticeAction();
    if (urgent) return urgent;
    return reportProblemAction();
  }

  // Stanar: prijem samo ako nije završen (novo useljenje); inače servisni fokus
  if (needsCheckIn) return checkInAction();
  const urgent = urgentNoticeAction();
  if (urgent) return urgent;
  return reportProblemAction();
}
