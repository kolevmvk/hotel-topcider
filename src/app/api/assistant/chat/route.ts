import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authorizeAssistantAccess } from "@/lib/assistant/auth";
import { isAssistantEnabled } from "@/lib/assistant/access-profiles";
import { nextPhase } from "@/lib/assistant/conversation-flow";
import { extractInsightsFromUserMessage } from "@/lib/assistant/extract-insights";
import { getFallbackReply } from "@/lib/assistant/knowledge";
import { chatWithOllama, type OllamaChatMessage } from "@/lib/assistant/ollama";
import { getAssistantStore } from "@/lib/assistant/service";
import { buildSystemPrompt } from "@/lib/assistant/system-prompt";
import type { AssistantMessage, AssistantSession, ConversationPhase } from "@/lib/assistant/types";
import { checkRateLimit } from "@/lib/analytics/rate-limit";
import { getRequestMeta } from "@/lib/audit/request-meta";
import { logSecurityEvent } from "@/lib/analytics/service";

async function getSessionDetail(store: ReturnType<typeof getAssistantStore>, id: string) {
  const sessions = await store.listSessions({ limit: 500 });
  return sessions.find((s) => s.id === id) ?? null;
}

export async function POST(request: NextRequest) {
  if (!isAssistantEnabled()) {
    return NextResponse.json({ error: "Asistent nije uključen." }, { status: 503 });
  }

  const auth = await authorizeAssistantAccess(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Potreban je pristup aplikaciji." }, { status: auth.status });
  }

  const meta = getRequestMeta(request);
  const rateKey = `assistant:${auth.username}:${meta.ipAddress ?? "unknown"}`;
  if (!checkRateLimit(rateKey)) {
    return NextResponse.json({ error: "Previše poruka. Sačekajte minut." }, { status: 429 });
  }

  let body: { sessionId?: string; message?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message || message.length > 2000) {
    return NextResponse.json({ error: "Poruka je prazna ili predugačka." }, { status: 400 });
  }

  const store = getAssistantStore();
  const now = new Date().toISOString();
  let sessionId = body.sessionId?.trim();
  let session: AssistantSession | null = sessionId
    ? await store.getSession(sessionId)
    : null;

  if (!session) {
    sessionId = randomUUID();
    session = {
      id: sessionId,
      accessUsername: auth.username,
      organization: auth.profile.organization,
      audience: auth.profile.audience,
      phase: "welcome",
      messageCount: 0,
      startedAt: now,
      lastActivityAt: now,
    };
    await store.createSession(session);
  }

  if (session.accessUsername !== auth.username) {
    return NextResponse.json({ error: "Sesija ne pripada ovom korisniku." }, { status: 403 });
  }

  const userMsg: AssistantMessage = {
    id: randomUUID(),
    sessionId: session.id,
    role: "user",
    content: message,
    phase: session.phase,
    timestamp: now,
  };
  await store.appendMessage(userMsg);

  for (const insight of extractInsightsFromUserMessage(session.id, message)) {
    await store.appendInsight(insight);
  }

  const detail = await getSessionDetail(store, session.id);
  const userCount = detail?.messages.filter((m) => m.role === "user").length ?? 1;
  const phase: ConversationPhase = nextPhase(session.phase, userCount);
  const systemPrompt = buildSystemPrompt(auth.profile, phase);

  const history = detail?.messages ?? [userMsg];
  const ollamaMessages: OllamaChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const ollamaResult = await chatWithOllama(ollamaMessages);
  const replyContent = ollamaResult.ok ? ollamaResult.content : getFallbackReply(message);

  const assistantMsg: AssistantMessage = {
    id: randomUUID(),
    sessionId: session.id,
    role: "assistant",
    content: replyContent,
    phase,
    timestamp: new Date().toISOString(),
  };
  await store.appendMessage(assistantMsg);

  await store.updateSession(session.id, {
    phase,
    lastActivityAt: assistantMsg.timestamp,
  });

  void logSecurityEvent(request, {
    eventName: "assistant.message",
    success: true,
    actorLabel: auth.profile.organization,
    actorType: "access_user",
    metadata: { sessionId: session.id, phase, ollama: ollamaResult.ok },
  });

  return NextResponse.json({
    sessionId: session.id,
    reply: replyContent,
    phase,
    ollamaAvailable: ollamaResult.ok,
  });
}
