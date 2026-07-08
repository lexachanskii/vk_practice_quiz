import { apiFetch } from "@/lib/api";
import type { SessionResultsResponse } from "@/types/quiz";

export async function getSessionResults(sessionId: string) {
  return apiFetch<SessionResultsResponse>(`/sessions/${sessionId}/results`, {
    method: "GET",
    auth: true,
  });
}