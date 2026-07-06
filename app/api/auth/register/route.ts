import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/app/lib/db";
import { hashPassword } from "@/app/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    name?: string;
    password?: string;
  };

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Please fill in every field." },
      { status: 400 },
    );
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  await createUser(name, email, hashPassword(password));

  return NextResponse.json({ ok: true }, { status: 201 });
}
