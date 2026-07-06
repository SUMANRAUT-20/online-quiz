import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/auth";
import { getQuizSummary } from "../lib/db";

export default async function QuizzesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const quiz = await getQuizSummary();

  return (
    <main className="page-shell">
      <div className="app-container">
        <header className="topbar">
          <Link className="brand" href="/dashboard">
            Online Quiz System
          </Link>
          <nav className="nav-actions" aria-label="Quiz navigation">
            <Link className="button button-light" href="/dashboard">
              Dashboard
            </Link>
          </nav>
        </header>

        <section className="hero-section">
          <p className="eyebrow">Quizzes</p>
          <h1>Available Quizzes</h1>
          <p className="muted">
            Practice small topics and keep building your frontend foundation.
          </p>
        </section>

        <section className="quiz-grid" aria-label="Available quizzes">
          <article className="quiz-card">
            <div className="quiz-card-header">
              <div>
                <h2>{quiz.title}</h2>
                <p className="quiz-meta">{quiz.description}</p>
              </div>
              <span className="badge">
                {quiz.questionCount} Questions
              </span>
            </div>
            <Link
              className="button button-primary"
              href={`/quiz/${quiz.id}`}
            >
              Start Quiz
            </Link>
          </article>
        </section>
      </div>
    </main>
  );
}
