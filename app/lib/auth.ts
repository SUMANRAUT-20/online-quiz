import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getUserById, type User } from "./db";

export const SESSION_COOKIE = "online_quiz_session";

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: number;
  expiresAt: number;
};

function getSessionSecret() {
  return (
    process.env.SESSION_SECRET ??
    "online-quiz-local-dev-secret-change-before-production"
  );
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const attemptedHash = scryptSync(password, salt, 64);
  const savedHash = Buffer.from(hash, "hex");

  if (attemptedHash.length !== savedHash.length) {
    return false;
  }

  return timingSafeEqual(attemptedHash, savedHash);
}

export function createSessionToken(userId: number) {
  const payload = toBase64Url(
    JSON.stringify({
      userId,
      expiresAt: Date.now() + ONE_WEEK_SECONDS * 1000,
    } satisfies SessionPayload),
  );

  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token?: string) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    const session = JSON.parse(fromBase64Url(payload)) as SessionPayload;

    if (!session.userId || session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    return null;
  }

  return getUserById(session.userId);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: ONE_WEEK_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
