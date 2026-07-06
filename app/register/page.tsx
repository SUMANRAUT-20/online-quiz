"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      setError("Please fill in every field.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/auth/register", {
      body: JSON.stringify({
        email: cleanEmail,
        name: cleanName,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Could not create account.");
      setIsSubmitting(false);
      return;
    }

    router.push("/login");
  }

  return (
    <main className="page-shell auth-shell">
      <section className="panel auth-panel">
        <p className="eyebrow">Create Account</p>
        <h1>Register</h1>
        <p className="muted">Start your quiz dashboard with a MySQL account.</p>

        {error ? <div className="alert alert-error">{error}</div> : null}

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              type="text"
              value={name}
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              type="password"
              value={password}
            />
          </div>

          <button
            className="button button-primary button-full"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link className="text-link" href="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
