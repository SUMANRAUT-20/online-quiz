import { NextResponse } from "next/server";
import { getQuizQuestions, toClientQuestion } from "@/app/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const questions = await getQuizQuestions(slug);

  return NextResponse.json({
    questions: questions.map(toClientQuestion),
  });
}
