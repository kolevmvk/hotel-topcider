/** Ko sme da vidi analitiku — access gate username-i iz ANALYTICS_VIEWERS (zarezom). */
export function isAnalyticsViewer(username: string | undefined): boolean {
  if (!username) return false;

  const raw = process.env.ANALYTICS_VIEWERS?.trim();
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .includes(username);
  }

  if (process.env.NODE_ENV === "development") return true;
  return false;
}
