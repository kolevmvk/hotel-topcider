import { randomUUID } from "crypto";
import type { AssistantInsight, InsightType } from "./types";

const SECRET_PATTERNS = [
  /password/i,
  /lozink/i,
  /\b\d{4}\b.*pin/i,
  /pin.*\d{4}/i,
];

function containsSecret(text: string): boolean {
  return SECRET_PATTERNS.some((p) => p.test(text));
}

function pickTopic(text: string): string[] {
  const topics: string[] = [];
  const lower = text.toLowerCase();
  if (/prijav|kvar|problem/.test(lower)) topics.push("prijave");
  if (/upravnik|panel/.test(lower)) topics.push("upravnik");
  if (/dežurn|dezurn|inbox/.test(lower)) topics.push("dežurna služba");
  if (/gost|soba|401|205/.test(lower)) topics.push("gost/soba");
  if (/obavešt|obavest/.test(lower)) topics.push("obaveštenja");
  if (/pregled|izvešt|izvest/.test(lower)) topics.push("pregled");
  if (/poruk/.test(lower)) topics.push("poruke");
  return topics;
}

function inferSentiment(text: string): string {
  const lower = text.toLowerCase();
  if (/odlič|super|korisno|jasno|dobro|sviđa/.test(lower)) return "positive";
  if (/nejasno|teško|loše|ne razum|zbunj/.test(lower)) return "negative";
  if (/možda|ok|u redu/.test(lower)) return "neutral";
  return "unknown";
}

function inferUsefulness(text: string): string {
  const lower = text.toLowerCase();
  if (/da|jeste|koristi|primeni|korisno/.test(lower) && !/ne /.test(lower)) return "useful";
  if (/ne|nije|ne bi/.test(lower)) return "not_useful";
  return "unclear";
}

export function extractInsightsFromUserMessage(
  sessionId: string,
  message: string
): AssistantInsight[] {
  if (!message.trim() || containsSecret(message)) return [];

  const now = new Date().toISOString();
  const insights: AssistantInsight[] = [];
  const add = (insightType: InsightType, value: string) => {
    if (!value.trim()) return;
    insights.push({
      id: randomUUID(),
      sessionId,
      insightType,
      value: value.slice(0, 500),
      extractedAt: now,
    });
  };

  const lower = message.toLowerCase();

  if (/papir|telefon|viber|email|excel|ručno/.test(lower)) {
    add("current_process", message.trim());
  }

  if (/prioritet|najvažnij|bitno|prvo|glavno/.test(lower)) {
    add("priority", message.trim());
  }

  if (/problem|boli|nedostaje|teško|sporo/.test(lower)) {
    add("pain_point", message.trim());
  }

  const sentiment = inferSentiment(message);
  if (sentiment !== "unknown") {
    add("sentiment", sentiment);
  }

  const usefulness = inferUsefulness(message);
  if (usefulness !== "unclear") {
    add("usefulness", usefulness);
  }

  for (const topic of pickTopic(message)) {
    add("topic", topic);
  }

  if (message.includes("?")) {
    add("open_question", message.trim());
  }

  return insights;
}
