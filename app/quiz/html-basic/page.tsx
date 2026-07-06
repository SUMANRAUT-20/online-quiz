import Link from "next/link";
import { redirect } from "next/navigation";
import { QuizClient } from "./QuizClient";
import { getCurrentUser } from "../../lib/auth";
import {
  QUESTIONS_PER_ATTEMPT,
  getQuizSummary,
  getRandomQuizQuestions,
  toClientQuestion,
} from "../../lib/db";

export default async function HtmlBasicQuizPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const quiz = await getQuizSummary();
  const questions = (await getRandomQuizQuestions(quiz.id)).map(
    toClientQuestion,
  );

  return (
    <main className="page-shell">
      <div className="app-container">
        <header className="topbar">
          <Link className="brand" href="/dashboard">
            Online Quiz System
          </Link>
          <nav className="nav-actions" aria-label="Quiz navigation">
            <Link className="button button-light" href="/quizzes">
              Quizzes
            </Link>
          </nav>
        </header>

        <section className="hero-section">
          <p className="eyebrow">Quiz</p>
          <h1>{quiz.title}</h1>
          <p className="muted">
            {quiz.description} You will get {QUESTIONS_PER_ATTEMPT} random
            questions from {quiz.questionCount} total questions.
          </p>
        </section>

        <QuizClient questions={questions} />
      </div>
    </main>
  );
}
