import type { NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/access/constants";
import { verifyAccessSessionToken } from "@/lib/access/session";
import { getAssistantProfile } from "./access-profiles";

export async function authorizeAssistantAccess(
  request: NextRequest
): Promise<
  | { ok: true; username: string; profile: NonNullable<ReturnType<typeof getAssistantProfile>> }
  | { ok: false; status: 401 }
> {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const session = await verifyAccessSessionToken(token);

  if (!session.valid || !session.username) {
    return { ok: false, status: 401 };
  }

  const profile = getAssistantProfile(session.username);
  if (!profile) {
    return { ok: false, status: 401 };
  }

  return { ok: true, username: session.username, profile };
}
