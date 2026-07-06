import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/auth";
import { getLatestResult } from "../lib/db";

export default async function ResultPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const result = await getLatestResult(user.id);

  if (!result) {
    return (
      <main className="page-shell auth-shell">
        <section className="panel status-panel">
          <p className="eyebrow">Result</p>
          <h1>No Result Yet</h1>
          <p className="muted">
            Complete a quiz and your latest score will appear here.
          </p>
          <Link className="button button-primary" href="/quizzes">
            Go to Quizzes
          </Link>
        </section>
      </main>
    );
  }

  const percentage = Math.round((result.score / result.total) * 100);

  return (
    <main className="page-shell auth-shell">
      <section className="panel status-panel">
        <p className="eyebrow">Result</p>
        <h1>{result.quizTitle}</h1>
        <div className="result-score" aria-label={`Score ${percentage}%`}>
          <strong>{percentage}%</strong>
          <span>
            {result.score}/{result.total}
          </span>
        </div>
        <p className="muted">
          Completed on {new Date(result.completedAt).toLocaleString()}
        </p>
        <div className="nav-actions">
          <Link className="button button-primary" href="/quiz/html-basic">
            Retake Quiz
          </Link>
          <Link className="button button-light" href="/dashboard">
            Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
