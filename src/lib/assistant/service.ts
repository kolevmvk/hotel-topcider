import type { AssistantStoreAdapter } from "./types";
import { getCompositeAssistantAdapter } from "./adapters/composite-adapter";

export function getAssistantStore(): AssistantStoreAdapter {
  return getCompositeAssistantAdapter();
}

export { getCompositeAssistantAdapter };
