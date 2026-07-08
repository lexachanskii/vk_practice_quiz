import { apiFetch } from "@/lib/api";
import type {
  CreateQuizPayload,
  CreateQuizResponse,
  FullQuiz,
  GetQuizResponse,
  MyQuizzesResponse,
  Quiz,
} from "@/types/quiz";

export async function getMyQuizzes() {
  const data = await apiFetch<MyQuizzesResponse | Quiz[]>("/quizzes/my", {
    method: "GET",
    auth: true,
  });

  if (Array.isArray(data)) {
    return data;
  }

  return data.quizzes;
}

export async function getQuizById(quizId: string) {
  const data = await apiFetch<GetQuizResponse | FullQuiz>(`/quizzes/${quizId}`, {
    method: "GET",
    auth: true,
  });

  if ("quiz" in data) {
    return data.quiz;
  }

  return data;
}

export async function createQuiz(payload: CreateQuizPayload) {
  const data = await apiFetch<CreateQuizResponse>("/quizzes", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });

  return data.quiz;
}

export async function deleteQuiz(quizId: string) {
  return apiFetch<{ message: string; quiz?: Quiz }>(`/quizzes/${quizId}`, {
    method: "DELETE",
    auth: true,
  });
}