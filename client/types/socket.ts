import type { QuestionType, QuizSession } from "@/types/quiz";

export type PublicAnswerOption = {
  id: string;
  text: string | null;
  imageUrl: string | null;
  order: number;
};

export type PublicQuestion = {
  sessionQuestionId: string;
  status: "PENDING" | "ACTIVE" | "FINISHED";
  startedAt: string | null;
  finishedAt: string | null;
  question: {
    id: string;
    text: string | null;
    imageUrl: string | null;
    type: QuestionType;
    order: number;
    timeLimitSeconds: number;
    points: number;
    options: PublicAnswerOption[];
  };
  expiresAt?: string;
};

export type CorrectOption = {
  id: string;
  text: string | null;
  imageUrl: string | null;
  order: number;
};

export type LeaderboardItem = {
  place: number;
  id: string;
  nickname: string;
  score: number;
  correctAnswersCount: number;
  totalAnswersCount: number;
};

export type LeaderboardUpdatedPayload = {
  sessionId: string;
  leaderboard: LeaderboardItem[];
};

export type QuestionStartedPayload = PublicQuestion & {
  sessionId: string;
};

export type QuestionFinishedPayload = {
  sessionId: string;
  questionId: string;
  reason: "manual" | "time_expired" | "session_finished";
  correctOptions: CorrectOption[];
};

export type AnswerAcceptedPayload = {
  answerId: string;
  sessionId: string;
  questionId: string;
  isCorrect: boolean;
  pointsAwarded: number;
};

export type SessionFinishedPayload = {
  session: QuizSession;
  leaderboard: LeaderboardItem[];
};

export type SocketCallback<T = unknown> = (response: {
  ok: boolean;
  message?: string;
} & T) => void;

import type { SessionParticipant } from "@/types/quiz";

export type ParticipantJoinedPayload = {
  sessionId: string;
  participant: Pick<SessionParticipant, "id" | "nickname" | "score">;
};

export type SessionStartedPayload = {
  session: {
    id: string;
    roomCode: string;
    status: "WAITING" | "ACTIVE" | "FINISHED" | "CANCELLED";
    startedAt?: string | null;
    finishedAt?: string | null;
  };
};

export type AnswerReceivedPayload = {
  sessionId: string;
  participantId: string;
  questionId: string;
  isCorrect: boolean;
};