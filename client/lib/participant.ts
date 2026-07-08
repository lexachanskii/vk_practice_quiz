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