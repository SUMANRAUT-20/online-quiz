"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      body: JSON.stringify({
        email,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Invalid email or password.");
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="page-shell auth-shell">
      <section className="panel auth-panel">
        <p className="eyebrow">Online Quiz System</p>
        <h1>Login</h1>
        <p className="muted">Sign in to continue to your quiz dashboard.</p>

        {error ? <div className="alert alert-error">{error}</div> : null}

        <form className="form" onSubmit={handleSubmit}>
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
              placeholder="Your password"
              type="password"
              value={password}
            />
          </div>

          <button
            className="button button-primary button-full"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          New here?{" "}
          <Link className="text-link" href="/register">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
