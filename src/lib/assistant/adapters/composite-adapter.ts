import { promises as fs } from "fs";
import path from "path";
import type {
  AssistantInsight,
  AssistantMessage,
  AssistantSession,
  AssistantSessionDetail,
  AssistantStoreAdapter,
  AssistantInsightsListFilters,
} from "../types";

const DATA_DIR = path.join(process.cwd(), ".data");
const SESSIONS_FILE = path.join(DATA_DIR, "assistant-sessions.json");
const MESSAGES_FILE = path.join(DATA_DIR, "assistant-messages.json");
const INSIGHTS_FILE = path.join(DATA_DIR, "assistant-insights.json");
const MAX_ENTRIES = 3000;

async function readJson<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJson<T>(file: string, data: T[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(file, JSON.stringify(data.slice(-MAX_ENTRIES), null, 2), "utf-8");
  } catch {
    /* readonly / serverless */
  }
}

export class CompositeAssistantAdapter implements AssistantStoreAdapter {
  private async loadSessions(): Promise<AssistantSession[]> {
    return readJson<AssistantSession>(SESSIONS_FILE);
  }

  private async loadMessages(): Promise<AssistantMessage[]> {
    return readJson<AssistantMessage>(MESSAGES_FILE);
  }

  private async loadInsights(): Promise<AssistantInsight[]> {
    return readJson<AssistantInsight>(INSIGHTS_FILE);
  }

  async getSession(id: string): Promise<AssistantSession | null> {
    const sessions = await this.loadSessions();
    return sessions.find((s) => s.id === id) ?? null;
  }

  async createSession(session: AssistantSession): Promise<void> {
    const sessions = await this.loadSessions();
    sessions.push(session);
    await writeJson(SESSIONS_FILE, sessions);
  }

  async updateSession(id: string, patch: Partial<AssistantSession>): Promise<void> {
    const sessions = await this.loadSessions();
    const idx = sessions.findIndex((s) => s.id === id);
    if (idx === -1) return;
    sessions[idx] = { ...sessions[idx], ...patch };
    await writeJson(SESSIONS_FILE, sessions);
  }

  async appendMessage(message: AssistantMessage): Promise<void> {
    const messages = await this.loadMessages();
    messages.push(message);
    await writeJson(MESSAGES_FILE, messages);

    const count = messages.filter(
      (m) => m.sessionId === message.sessionId
    ).length;
    await this.updateSession(message.sessionId, {
      messageCount: count,
      lastActivityAt: message.timestamp,
    });
  }

  async appendInsight(insight: AssistantInsight): Promise<void> {
    const insights = await this.loadInsights();
    insights.push(insight);
    await writeJson(INSIGHTS_FILE, insights);
  }

  async listSessions(filters?: AssistantInsightsListFilters): Promise<AssistantSessionDetail[]> {
    const [sessions, messages, insights] = await Promise.all([
      this.loadSessions(),
      this.loadMessages(),
      this.loadInsights(),
    ]);

    let result = [...sessions].sort((a, b) =>
      b.lastActivityAt.localeCompare(a.lastActivityAt)
    );

    if (filters?.accessUsername) {
      result = result.filter((s) => s.accessUsername === filters.accessUsername);
    }

    const limit = filters?.limit ?? 100;
    result = result.slice(0, limit);

    return result.map((session) => ({
      ...session,
      messages: messages
        .filter((m) => m.sessionId === session.id)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
      insights: insights
        .filter((i) => i.sessionId === session.id)
        .sort((a, b) => a.extractedAt.localeCompare(b.extractedAt)),
    }));
  }
}

let instance: CompositeAssistantAdapter | null = null;

export function getCompositeAssistantAdapter(): CompositeAssistantAdapter {
  if (!instance) instance = new CompositeAssistantAdapter();
  return instance;
}
