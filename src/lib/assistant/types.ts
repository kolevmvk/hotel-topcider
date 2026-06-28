export type AssistantAudience = "executive" | "operational" | "general" | "developer";

export type ConversationPhase = "welcome" | "guide" | "probe" | "reflect" | "close";

export interface AssistantProfile {
  username: string;
  label: string;
  organization: string;
  audience: AssistantAudience;
  greeting?: string;
  suggestedSteps: string[];
}

export interface AssistantContextResponse {
  enabled: boolean;
  ollamaAvailable: boolean;
  organization: string;
  audience: AssistantAudience;
  greeting: string;
  suggestedSteps: string[];
  demoMode: boolean;
  consentText: string;
}

export interface AssistantSession {
  id: string;
  accessUsername: string;
  organization: string;
  audience: AssistantAudience;
  visitId?: string;
  phase: ConversationPhase;
  messageCount: number;
  startedAt: string;
  endedAt?: string;
  lastActivityAt: string;
}

export interface AssistantMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  phase: ConversationPhase;
  timestamp: string;
}

export type InsightType =
  | "pain_point"
  | "priority"
  | "sentiment"
  | "current_process"
  | "usefulness"
  | "topic"
  | "open_question";

export interface AssistantInsight {
  id: string;
  sessionId: string;
  insightType: InsightType;
  value: string;
  extractedAt: string;
}

export interface AssistantSessionDetail extends AssistantSession {
  messages: AssistantMessage[];
  insights: AssistantInsight[];
}

export interface AssistantInsightsListFilters {
  limit?: number;
  accessUsername?: string;
}

export interface AssistantStoreAdapter {
  getSession(id: string): Promise<AssistantSession | null>;
  createSession(session: AssistantSession): Promise<void>;
  updateSession(id: string, patch: Partial<AssistantSession>): Promise<void>;
  appendMessage(message: AssistantMessage): Promise<void>;
  appendInsight(insight: AssistantInsight): Promise<void>;
  listSessions(filters?: AssistantInsightsListFilters): Promise<AssistantSessionDetail[]>;
}
