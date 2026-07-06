"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import type { QuizOptionKey, QuizQuestionForClient } from "../../lib/db";

const QUESTIONS_PER_ATTEMPT = 5;

export function QuizClient({
  questions,
}: {
  questions: QuizQuestionForClient[];
}) {
  const router = useRouter();
  const displayedQuestions = questions.slice(0, QUESTIONS_PER_ATTEMPT);
  const [answers, setAnswers] = useState<Record<number, QuizOptionKey>>({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (Object.keys(answers).length !== displayedQuestions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/quizzes/html-basic/submit", {
      body: JSON.stringify({ answers }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Could not submit quiz.");
      setIsSubmitting(false);
      return;
    }

    router.push("/result");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="question-list">
        {displayedQuestions.map((question, index) => (
          <section className="question-card" key={question.id}>
            <p className="question-title">
              {index + 1}. {question.question}
            </p>
            <div className="option-list">
              {question.options.map((option) => (
                <label className="option" key={`${question.id}-${option.key}`}>
                  <input
                    checked={answers[question.id] === option.key}
                    name={`question-${question.id}`}
                    onChange={() => {
                      setAnswers((currentAnswers) => ({
                        ...currentAnswers,
                        [question.id]: option.key,
                      }));
                      setError("");
                    }}
                    type="radio"
                  />
                  <span>
                    {option.key}. {option.text}
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>

      {error ? <div className="alert alert-warning">{error}</div> : null}

      <div className="quiz-footer">
        <p className="muted">
          Answered {Object.keys(answers).length} of {displayedQuestions.length}
        </p>
        <button
          className="button button-primary"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </form>
  );
}
