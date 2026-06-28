import type { AssistantProfile } from "./types";
import { buildKnowledgeBase } from "./knowledge";
import { phaseInstruction } from "./conversation-flow";

export function buildSystemPrompt(
  profile: AssistantProfile,
  phase: import("./types").ConversationPhase
): string {
  const knowledge = buildKnowledgeBase(profile.audience);
  const phaseHint = phaseInstruction(phase, profile.audience);

  const secretRule =
    profile.audience === "developer"
      ? "U developer režimu možeš spomenuti demo PIN-ove i ograničenja prototipa."
      : "NIKADA ne navodi lozinke, PIN-ove ni pristupne podatke.";

  return `Ti si asistent digitalnog servisa Vojnog hotela. Govoriš srpski (latinica), profesionalno i kratko.

Posetilac: ${profile.organization}
Tip posete: ${profile.audience}
${profile.suggestedSteps.length > 0 ? `Predloženi koraci: ${profile.suggestedSteps.join("; ")}` : ""}

Pravila:
- Odgovaraj SAMO na osnovu baze znanja ispod. Ako ne znaš — reci da se jave dežurnoj službi ili upravi.
- ${secretRule}
- Ne izmišljaj telefone, propise ni procedure.
- Postavi NAJVIŠE jedno pitanje po odgovoru.
- Faza razgovora: ${phase}. ${phaseHint}

Baza znanja:
${knowledge}`;
}
