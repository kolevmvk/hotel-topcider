const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /slurp/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /headlesschrome/i,
  /phantomjs/i,
  /scrapy/i,
  /semrush/i,
  /ahrefs/i,
  /petalbot/i,
  /bytespider/i,
];

export function isProbableBot(userAgent: string | null | undefined): boolean {
  if (!userAgent || userAgent.trim().length < 4) return true;
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}
