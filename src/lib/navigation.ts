import type { IconName } from "./icons";
import type { UserRole } from "./types";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

export interface DashboardItem {
  href: string;
  title: string;
  description: string;
  icon: IconName;
}

export interface DashboardSection {
  label: string;
  title: string;
  subtitle: string;
  items: DashboardItem[];
}

export type UpravaTab =
  | "pregled"
  | "problems"
  | "people"
  | "content"
  | "operativa";

export function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case "stanar":
      return [
        { href: "/", label: "Početna", icon: "home" },
        { href: "/obavestenja", label: "Obaveštenja", icon: "bell" },
        { href: "/soba", label: "Soba", icon: "bed" },
        { href: "/moje-prijave", label: "Prijave", icon: "list" },
        { href: "/poruke", label: "Poruke", icon: "mail" },
      ];
    case "gost":
      return [
        { href: "/", label: "Početna", icon: "home" },
        { href: "/soba", label: "Soba", icon: "bed" },
        { href: "/moje-prijave", label: "Prijave", icon: "list" },
        { href: "/poruke", label: "Poruke", icon: "mail" },
        { href: "/obavestenja", label: "Obaveštenja", icon: "bell" },
      ];
    case "dezurni":
      return [
        { href: "/", label: "Inbox", icon: "home" },
        { href: "/sobe", label: "Sobe", icon: "bed" },
        { href: "/moje-prijave", label: "Prijave", icon: "clipboard" },
        { href: "/poruke", label: "Poruke", icon: "mail" },
        { href: "/uprava", label: "Evidencija", icon: "clock" },
      ];
    case "upravnik":
      return [
        { href: "/", label: "Pregled", icon: "home" },
        { href: "/uprava", label: "Panel", icon: "shield" },
        { href: "/sobe", label: "Sobe", icon: "bed" },
        { href: "/moje-prijave", label: "Prijave", icon: "clipboard" },
        { href: "/poruke", label: "Poruke", icon: "mail" },
      ];
  }
}

export function getHeaderLinks(role: UserRole): NavItem[] {
  switch (role) {
    case "stanar":
      return [
        { href: "/obavestenja", label: "Obaveštenja", icon: "bell" },
        { href: "/soba", label: "Soba", icon: "bed" },
        { href: "/prijava", label: "Prijava", icon: "report" },
        { href: "/moje-prijave", label: "Prijave", icon: "list" },
        { href: "/poruke", label: "Poruke", icon: "mail" },
      ];
    case "gost":
      return [
        { href: "/soba", label: "Soba", icon: "bed" },
        { href: "/prijava", label: "Prijava", icon: "report" },
        { href: "/moje-prijave", label: "Prijave", icon: "list" },
        { href: "/poruke", label: "Poruke", icon: "mail" },
        { href: "/obavestenja", label: "Obaveštenja", icon: "bell" },
      ];
    case "dezurni":
      return [
        { href: "/sobe", label: "Sobe", icon: "bed" },
        { href: "/moje-prijave", label: "Prijave", icon: "clipboard" },
        { href: "/poruke", label: "Poruke", icon: "mail" },
        { href: "/uprava", label: "Evidencija", icon: "clock" },
      ];
    case "upravnik":
      return [
        { href: "/uprava", label: "Panel", icon: "shield" },
        { href: "/sobe", label: "Sobe", icon: "bed" },
        { href: "/moje-prijave", label: "Prijave", icon: "clipboard" },
        { href: "/poruke", label: "Poruke", icon: "mail" },
      ];
  }
}

export function getHomeTagline(role: UserRole): string {
  switch (role) {
    case "stanar":
      return "Dugoročni boravak — obaveštenja, prijave i komunikacija sa upravom";
    case "gost":
      return "Privremeni boravak — prijem sobe, prijave i komunikacija sa službom";
    case "dezurni":
      return "Smenski inbox — prijave, gosti i potvrde na jednom mestu";
    case "upravnik":
      return "Command center — sobe, prijave, korisnici i obaveštenja";
  }
}

export function getDashboardSections(role: UserRole): DashboardSection[] {
  switch (role) {
    case "stanar":
      return [
        {
          label: "Vaš boravak",
          title: "Hotel servis",
          subtitle: "Obaveštenja, prijave i komunikacija sa upravom",
          items: [
            { href: "/soba", title: "Moja soba", description: "Pregled inventara i stanja sobe", icon: "bed" },
            { href: "/obavestenja", title: "Obaveštenja", description: "Najave i službene informacije", icon: "bell" },
            { href: "/prijava", title: "Prijavi problem", description: "Evidentirajte kvar u smeštaju", icon: "report" },
            { href: "/moje-prijave", title: "Moje prijave", description: "Pregled i status vaših prijava", icon: "list" },
            { href: "/poruke", title: "Poruke", description: "Obraćanje upravniku i dežurnoj službi", icon: "mail" },
          ],
        },
        {
          label: "Pomoć",
          title: "Informacije i kontakt",
          subtitle: "Kućni red, uputstva i telefoni službi",
          items: [
            { href: "/informacije", title: "Korisne informacije", description: "Kućni red i uputstva", icon: "scroll" },
            { href: "/kontakti", title: "Kontakti", description: "Uprava, dežurna služba, održavanje", icon: "phone" },
          ],
        },
      ];
    case "gost":
      return [
        {
          label: "Privremeni boravak",
          title: "Vaš smeštaj",
          subtitle: "Kredencijale ste dobili od dežurne službe",
          items: [
            { href: "/soba", title: "Moja soba", description: "Inventar, potvrda prijema i predaje", icon: "bed" },
            { href: "/prijava", title: "Prijavi problem", description: "Evidentirajte kvar tokom boravka", icon: "report" },
            { href: "/moje-prijave", title: "Moje prijave", description: "Status vaših prijava", icon: "list" },
            { href: "/poruke", title: "Poruke", description: "Kontakt sa dežurnom službom", icon: "mail" },
            { href: "/obavestenja", title: "Obaveštenja", description: "Informacije hotela", icon: "bell" },
          ],
        },
        {
          label: "Pomoć",
          title: "Kontakt",
          subtitle: "Dežurna služba i uprava hotela",
          items: [
            { href: "/kontakti", title: "Kontakti", description: "Telefoni službi hotela", icon: "phone" },
            { href: "/informacije", title: "Informacije", description: "Kućni red i uputstva", icon: "scroll" },
          ],
        },
      ];
    case "dezurni":
      return [
        {
          label: "Pregled",
          title: "Informacije hotela",
          subtitle: "Obaveštenja i kontakti",
          items: [
            { href: "/obavestenja", title: "Obaveštenja", description: "Aktuelne najave hotela", icon: "bell" },
            { href: "/kontakti", title: "Kontakti", description: "Telefoni službi", icon: "phone" },
          ],
        },
      ];
    case "upravnik":
      return [
        {
          label: "Referenca",
          title: "Pomoćni sadržaj",
          subtitle: "Ono što stanari i gosti vide u aplikaciji",
          items: [
            { href: "/obavestenja", title: "Obaveštenja", description: "Pregled objava", icon: "bell" },
            { href: "/kontakti", title: "Kontakti", description: "Telefoni službi", icon: "phone" },
            { href: "/informacije", title: "Informacije", description: "Kućni red i uputstva", icon: "scroll" },
          ],
        },
      ];
  }
}

export function upravaTabHref(tab: UpravaTab): string {
  return `/uprava?tab=${tab}`;
}
