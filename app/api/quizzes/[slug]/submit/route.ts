import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { getQuizQuestions, saveResult, type QuizOptionKey } from "@/app/lib/db";
import { htmlBasicQuiz } from "@/app/lib/quizData";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Please login first." }, { status: 401 });
  }

  const { slug } = await context.params;
  const body = (await request.json()) as {
    answers?: Record<string, QuizOptionKey>;
  };
  const answers = body.answers ?? {};
  const answeredQuestionIds = Object.keys(answers);
  const questions = await getQuizQuestions(slug);
  const answeredQuestions = questions.filter((question) =>
    answeredQuestionIds.includes(String(question.id)),
  );

  if (questions.length === 0) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }

  if (
    answeredQuestionIds.length === 0 ||
    answeredQuestionIds.length !== answeredQuestions.length
  ) {
    return NextResponse.json(
      { error: "Please answer all questions before submitting." },
      { status: 400 },
    );
  }

  const score = answeredQuestions.reduce((total, question) => {
    return total + (answers[String(question.id)] === question.correct_option ? 1 : 0);
  }, 0);

  await saveResult({
    quizSlug: slug,
    quizTitle: htmlBasicQuiz.title,
    score,
    total: answeredQuestions.length,
    userId: user.id,
  });

  return NextResponse.json({
    result: {
      quizId: slug,
      quizTitle: htmlBasicQuiz.title,
      score,
      total: answeredQuestions.length,
      completedAt: new Date().toISOString(),
    },
  });
}
