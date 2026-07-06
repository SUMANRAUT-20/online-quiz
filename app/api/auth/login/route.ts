import { NextResponse } from "next/server";
import {
  createSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE,
  verifyPassword,
} from "@/app/lib/auth";
import { findUserByEmail } from "@/app/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const user = await findUserByEmail(email);

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });

  response.cookies.set(
    SESSION_COOKIE,
    createSessionToken(user.id),
    getSessionCookieOptions(),
  );

  return response;
}
