import type { QuizSession, SessionParticipant } from "@/types/quiz";

const PARTICIPANT_KEY = "quizflow_participant";
const PARTICIPANT_SESSION_KEY = "quizflow_participant_session";

export function saveParticipantSession(
  participant: SessionParticipant,
  session: QuizSession
) {
  localStorage.setItem(PARTICIPANT_KEY, JSON.stringify(participant));
  localStorage.setItem(PARTICIPANT_SESSION_KEY, JSON.stringify(session));
}

export function getSavedParticipant(): SessionParticipant | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawParticipant = localStorage.getItem(PARTICIPANT_KEY);

  if (!rawParticipant) {
    return null;
  }

  try {
    return JSON.parse(rawParticipant) as SessionParticipant;
  } catch {
    return null;
  }
}

export function getSavedParticipantSession(): QuizSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = localStorage.getItem(PARTICIPANT_SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as QuizSession;
  } catch {
    return null;
  }
}

export function clearParticipantSession() {
  localStorage.removeItem(PARTICIPANT_KEY);
  localStorage.removeItem(PARTICIPANT_SESSION_KEY);
}

import type { LeaderboardItem } from "@/types/socket";

const PARTICIPANT_RESULTS_KEY = "quizflow_participant_results";

export type SavedParticipantResults = {
  sessionId: string;
  leaderboard: LeaderboardItem[];
  finishedAt: string;
};

export function saveParticipantResults(
  sessionId: string,
  leaderboard: LeaderboardItem[]
) {
  const data: SavedParticipantResults = {
    sessionId,
    leaderboard,
    finishedAt: new Date().toISOString(),
  };

  localStorage.setItem(PARTICIPANT_RESULTS_KEY, JSON.stringify(data));
}

export function getSavedParticipantResults(
  sessionId: string
): SavedParticipantResults | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawData = localStorage.getItem(PARTICIPANT_RESULTS_KEY);

  if (!rawData) {
    return null;
  }

  try {
    const data = JSON.parse(rawData) as SavedParticipantResults;

    if (data.sessionId !== sessionId) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}