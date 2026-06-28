import { INFO_SECTIONS } from "@/lib/constants";
import type { AssistantAudience } from "./types";

const STATIC_FAQ = `
Digitalni servis Vojnog hotela — web aplikacija za telefon.

Uloge:
- Stanar: broj sobe + PIN — prijave, obaveštenja, poruke, moja soba
- Gost: privremeni boravak — prijem sobe, prijave, poruke dežurnoj
- Dežurni: službeni nalog — inbox na početnoj, prijave, sobe, zadaci
- Upravnik: panel upravnika — prijave, ljudi, obaveštenja, korisne informacije

Ključne rute:
- /login — prijava ulogom
- /pregled — operativni izveštaj za rukovodstvo (bez uloge hotela)
- /informacije — kućni red i uputstva
- /uprava — panel upravnika
- /prijava — nova prijava problema
- /poruke — poruke
`;

const DEVELOPER_NOTES = `
Developer / demo napomene (samo za audience developer):
- Poslovni podaci su u localStorage browsera — ne dele se između uređaja
- Brzi ulaz na /login kada je NEXT_PUBLIC_SHOW_DEMO=true
- Demo PIN: upravnik/0000, dezurni/1111, stanar soba 205/1234, gost 401/5678
- Analitika: /interno/analitika za ANALYTICS_VIEWERS
- Ovo je funkcionalni prototip spreman za backend integraciju (Supabase šema u docs/)
`;

export function buildKnowledgeBase(audience: AssistantAudience): string {
  const sections = INFO_SECTIONS.map(
    (s) => `## ${s.title}\n${s.content}`
  ).join("\n\n");

  let base = `${STATIC_FAQ}\n\n--- Korisne informacije hotela ---\n\n${sections}`;

  if (audience === "developer") {
    base += `\n\n--- Developer ---\n${DEVELOPER_NOTES}`;
  }

  return base;
}

export function getFallbackReply(topic: string): string {
  const lower = topic.toLowerCase();
  if (lower.includes("upravnik") || lower.includes("panel")) {
    return "Upravnik vidi panel na /uprava — prijave, ljudi, obaveštenja i korisne informacije. Predlog: prijavite se kao upravnik (službeni nalog) i otvorite Panel u meniju.";
  }
  if (lower.includes("pregled") || lower.includes("izveštaj")) {
    return "Operativni izveštaj za rukovodstvo je na /pregled — zauzetost soba, prijave i bezbednost, bez ulaska u ulogu hotela.";
  }
  if (lower.includes("dežurn") || lower.includes("dezurn")) {
    return "Dežurna služba vidi smenski inbox na početnoj stranici — prijave, poruke i zadaci na čekanju.";
  }
  if (lower.includes("gost") || lower.includes("401")) {
    return "Gost se prijavljuje brojem sobe i PIN-om, zatim završava prijem sobe u odeljku Moja soba.";
  }
  return "Digitalni servis povezuje stanare, goste, dežurnu službu i upravnika. Izaberite ulogu na /login ili pitajte konkretno — npr. prijave, obaveštenja, panel upravnika.";
}
