export interface OllamaChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function getOllamaBaseUrl(): string {
  return process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
}

export function getAssistantModel(): string {
  return process.env.ASSISTANT_MODEL ?? "gemma3:4b";
}

export async function checkOllamaAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${getOllamaBaseUrl()}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function chatWithOllama(
  messages: OllamaChatMessage[]
): Promise<{ ok: true; content: string } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${getOllamaBaseUrl()}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: getAssistantModel(),
        messages,
        stream: false,
        options: { temperature: 0.4, num_predict: 512 },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      return { ok: false, error: `Ollama greška (${res.status})` };
    }

    const data = (await res.json()) as { message?: { content?: string } };
    const content = data.message?.content?.trim();
    if (!content) {
      return { ok: false, error: "Prazan odgovor modela." };
    }

    return { ok: true, content };
  } catch {
    return { ok: false, error: "Lokalni AI asistent nije dostupan." };
  }
}
