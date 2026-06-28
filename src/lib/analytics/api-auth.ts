import type { NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/access/constants";
import { verifyAccessSessionToken } from "@/lib/access/session";
import { isAnalyticsViewer } from "./viewer";

export async function authorizeAnalyticsApi(
  request: NextRequest
): Promise<{ ok: true; username: string } | { ok: false; status: 401 | 403 }> {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const session = await verifyAccessSessionToken(token);

  if (!session.valid || !session.username) {
    return { ok: false, status: 401 };
  }

  if (!isAnalyticsViewer(session.username)) {
    return { ok: false, status: 403 };
  }

  return { ok: true, username: session.username };
}
