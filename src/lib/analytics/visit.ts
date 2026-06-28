const VISIT_KEY = "ht_analytics_visit_id";

export function getVisitId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem(VISIT_KEY);
    if (!id) {
      id = `visit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(VISIT_KEY, id);
    }
    return id;
  } catch {
    return `visit-${Date.now()}`;
  }
}
