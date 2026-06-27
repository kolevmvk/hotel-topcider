import { ACCESS_SESSION_MAX_AGE_SEC } from "./constants";
import { decodePayload, encodePayload, signPayload, verifySignature } from "./crypto";

interface AccessTokenPayload {
  u: string;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SITE_ACCESS_SECRET;
  if (!secret) {
    throw new Error("SITE_ACCESS_SECRET nije podešen.");
  }
  return secret;
}

export async function createAccessSessionToken(username: string): Promise<string> {
  const payload: AccessTokenPayload = {
    u: username,
    exp: Date.now() + ACCESS_SESSION_MAX_AGE_SEC * 1000,
  };
  const encoded = encodePayload(payload);
  const signature = await signPayload(encoded, getSecret());
  return `${encoded}.${signature}`;
}

export async function verifyAccessSessionToken(
  token: string | undefined | null
): Promise<{ valid: boolean; username?: string }> {
  if (!token || !token.includes(".")) {
    return { valid: false };
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return { valid: false };
  }

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return { valid: false };
  }

  const sigOk = await verifySignature(encoded, signature, secret);
  if (!sigOk) {
    return { valid: false };
  }

  const payload = decodePayload<AccessTokenPayload>(encoded);
  if (!payload?.u || !payload.exp || payload.exp < Date.now()) {
    return { valid: false };
  }

  return { valid: true, username: payload.u };
}
