import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "../components/LogoutButton";
import { getCurrentUser } from "../lib/auth";
import { getQuizSummary } from "../lib/db";

export default async function DashboardPage() {
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
          <nav className="nav-actions" aria-label="Dashboard navigation">
            <Link className="button button-light" href="/quizzes">
              Quizzes
            </Link>
            <LogoutButton />
          </nav>
        </header>

        <section className="hero-section">
          <p className="eyebrow">Dashboard</p>
          <h1>Welcome, {user.name}</h1>
          <p className="muted">
            Your available quizzes are ready. Start with the HTML basics
            challenge and review your score instantly after submission.
          </p>
        </section>

        <section className="section-stack" aria-labelledby="quiz-list-title">
          <div className="section-heading">
            <h2 id="quiz-list-title">Quiz List</h2>
            <Link className="text-link" href="/quizzes">
              View all
            </Link>
          </div>

          <div className="quiz-grid">
            <article className="quiz-card">
              <div className="quiz-card-header">
                <div>
                  <h3>{quiz.title}</h3>
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
          </div>
        </section>
      </div>
    </main>
  );
}
