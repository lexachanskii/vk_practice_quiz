import { apiFetch } from "@/lib/api";
import type {
  JoinSessionPayload,
  JoinSessionResponse,
  OrganizerSessionsResponse,
  ParticipantHistoryResponse,
  QuizSession,
  SessionParticipant,
  StartQuizSessionResponse,
} from "@/types/quiz";

export async function startQuizSession(quizId: string) {
  const data = await apiFetch<StartQuizSessionResponse | QuizSession>(
    `/quizzes/${quizId}/start`,
    {
      method: "POST",
      auth: true,
    }
  );

  if ("session" in data) {
    return data.session;
  }

  return data;
}

export async function joinQuizSession(payload: JoinSessionPayload) {
  const data = await apiFetch<
    JoinSessionResponse | { session: QuizSession; participant: SessionParticipant }
  >("/sessions/join", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });

  return {
    session: data.session,
    participant: data.participant,
  };
}

export async function getMyOrganizedSessions() {
  const data = await apiFetch<OrganizerSessionsResponse>(
    "/sessions/my-organized",
    {
      method: "GET",
      auth: true,
    }
  );

  return data.sessions;
}

export async function getMyParticipations() {
  const data = await apiFetch<ParticipantHistoryResponse>(
    "/sessions/my-participations",
    {
      method: "GET",
      auth: true,
    }
  );

  return data.participations;
}