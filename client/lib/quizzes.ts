import { apiFetch } from "@/lib/api";
import type { MyQuizzesResponse, Quiz } from "@/types/quiz";

export async function getMyQuizzes() {
  const data = await apiFetch<MyQuizzesResponse>("/quizzes/my", {
    method: "GET",
    auth: true,
  });

  return data.quizzes;
}

export async function deleteQuiz(quizId: string) {
  return apiFetch<{ message: string; quiz?: Quiz }>(`/quizzes/${quizId}`, {
    method: "DELETE",
    auth: true,
  });
}