import { NextResponse } from "next/server";
import { getRandomQuizQuestions, toClientQuestion } from "@/app/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const questions = await getRandomQuizQuestions(slug);

  return NextResponse.json({
    questions: questions.map(toClientQuestion),
  });
}
