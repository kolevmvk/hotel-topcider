import type { AssistantAudience, ConversationPhase } from "./types";

export function nextPhase(current: ConversationPhase, userMessageCount: number): ConversationPhase {
  if (userMessageCount <= 0) return "welcome";
  if (userMessageCount === 1) return "guide";
  if (userMessageCount === 2) return "probe";
  if (userMessageCount === 3) return "reflect";
  return "close";
}

export function probeQuestion(audience: AssistantAudience): string {
  switch (audience) {
    case "executive":
      return "Da li vam je prioritet brz pregled celog objekta (/pregled) ili detaljan rad iz uloge upravnika?";
    case "operational":
      return "U vašoj jedinici — da li su vam najbitnije prijave kvarova, poruke dežurnoj ili pregled soba?";
    case "developer":
      return "Da li želite da prođemo demo uloge, ograničenja prototipa ili arhitekturu sistema?";
    default:
      return "Šta bi vam u svakodnevnom radu bilo najkorisnije — prijave problema, obaveštenja ili poruke službama?";
  }
}

export function reflectQuestion(): string {
  return "Da li vam ovo deluje korisno za rad u vašoj jedinici?";
}

export function phaseInstruction(phase: ConversationPhase, audience: AssistantAudience): string {
  switch (phase) {
    case "welcome":
      return "Pozdravi posetioca i pitaj šta ga zanima. Jedno pitanje.";
    case "guide":
      return "Odgovori na pitanje koristeći bazu znanja. Predloži konkretnu rutu ili ulogu. Na kraju postavi JEDNO kratko pitanje o njihovom kontekstu.";
    case "probe":
      return `Postavi ovo pitanje prirodno, posle kratkog odgovora: "${probeQuestion(audience)}"`;
    case "reflect":
      return `Postavi: "${reflectQuestion()}" — kratko, bez dodatnih pitanja.`;
    case "close":
      return "Zahvali se i predloži jedan sledeći korak u aplikaciji (ruta ili uloga). Ne postavljaj nova pitanja.";
    default:
      return "Budi kratak i profesionalan.";
  }
}
