import { apiFetch } from "@/lib/api";
import type {
  CreateQuestionPayload,
  CreateQuestionResponse,
  FullQuestion,
} from "@/types/quiz";

export async function createQuestion(
  quizId: string,
  payload: CreateQuestionPayload
) {
  const data = await apiFetch<CreateQuestionResponse | FullQuestion>(
    `/quizzes/${quizId}/questions`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }
  );

  if ("question" in data) {
    return data.question;
  }

  return data;
}

export async function deleteQuestion(questionId: string) {
  return apiFetch<{ message: string }>(`/questions/${questionId}`, {
    method: "DELETE",
    auth: true,
  });
}