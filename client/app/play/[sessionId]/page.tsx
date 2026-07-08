"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Send,
  Trophy,
  UserRound,
  XCircle,
} from "lucide-react";
import type { Socket } from "socket.io-client";
import { AppButton } from "@/components/ui/AppButton";
import { Logo } from "@/components/layout/Logo";
import { getBackendFileUrl } from "@/lib/api";
import { createSocket } from "@/lib/socket";
import {
  clearParticipantSession,
  getSavedParticipant,
  getSavedParticipantSession,
} from "@/lib/participant";
import type { QuizSession, SessionParticipant } from "@/types/quiz";
import type {
  AnswerAcceptedPayload,
  CorrectOption,
  LeaderboardItem,
  LeaderboardUpdatedPayload,
  QuestionFinishedPayload,
  QuestionStartedPayload,
  SessionFinishedPayload,
} from "@/types/socket";

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();

  const sessionId = String(params.sessionId);

  const socketRef = useRef<Socket | null>(null);

  const [participant, setParticipant] = useState<SessionParticipant | null>(() =>
    getSavedParticipant()
  );

  const [session, setSession] = useState<QuizSession | null>(() =>
    getSavedParticipantSession()
  );
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  const [currentQuestion, setCurrentQuestion] =
    useState<QuestionStartedPayload | null>(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerResult, setAnswerResult] =
    useState<AnswerAcceptedPayload | null>(null);

  const [correctOptions, setCorrectOptions] = useState<CorrectOption[]>([]);
  const [questionFinishedReason, setQuestionFinishedReason] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  useEffect(() => {
    const savedParticipant = getSavedParticipant();
    const savedSession = getSavedParticipantSession();

    if (!savedParticipant || !savedSession) {
      router.replace("/join");
      return;
    }

    if (savedSession.id !== sessionId) {
      router.replace("/join");
      return;
    }

    setParticipant(savedParticipant);
    setSession(savedSession);
  }, [router, sessionId]);

  useEffect(() => {
    if (!participant || !session) {
      return;
    }

    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError("");

      socket.emit(
        "participant_join_session",
        {
          sessionId: session.id,
          participantId: participant.id,
        },
        (response: { ok: boolean; message?: string }) => {
          if (!response.ok) {
            setConnectionError(response.message || "Не удалось подключиться");
          }
        }
      );
    });

    socket.on("connect_error", (error) => {
      setIsConnected(false);
      setConnectionError(error.message);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("session_started", () => {
      setSession((currentSession) =>
        currentSession
          ? {
              ...currentSession,
              status: "ACTIVE",
            }
          : currentSession
      );
    });

    socket.on("question_started", (payload: QuestionStartedPayload) => {
      setCurrentQuestion(payload);
      setSelectedOptionIds([]);
      setAnswerResult(null);
      setCorrectOptions([]);
      setQuestionFinishedReason("");
      setSecondsLeft(payload.question.timeLimitSeconds);
    });

    socket.on("answer_accepted", (payload: AnswerAcceptedPayload) => {
      setAnswerResult(payload);
      setIsSubmittingAnswer(false);

      setParticipant((currentParticipant) =>
        currentParticipant
          ? {
              ...currentParticipant,
              score: currentParticipant.score + payload.pointsAwarded,
            }
          : currentParticipant
      );
    });

    socket.on("question_finished", (payload: QuestionFinishedPayload) => {
      setCorrectOptions(payload.correctOptions);
      setQuestionFinishedReason(payload.reason);
      setSecondsLeft(0);
      setIsSubmittingAnswer(false);
    });

    socket.on("leaderboard_updated", (payload: LeaderboardUpdatedPayload) => {
      setLeaderboard(payload.leaderboard);
    });

    socket.on("session_finished", (payload: SessionFinishedPayload) => {
      setIsSessionFinished(true);
      setSession(payload.session);
      setLeaderboard(payload.leaderboard);
      setCurrentQuestion(null);
      setSecondsLeft(null);
    });

    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [participant, session]);

  useEffect(() => {
    if (!currentQuestion?.expiresAt || correctOptions.length > 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const expiresAtTime = new Date(currentQuestion.expiresAt as string).getTime();
      const nextSecondsLeft = Math.max(
        0,
        Math.ceil((expiresAtTime - Date.now()) / 1000)
      );

      setSecondsLeft(nextSecondsLeft);

      if (nextSecondsLeft <= 0) {
        window.clearInterval(intervalId);
      }
    }, 300);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentQuestion, correctOptions.length]);

  function handleLeave() {
    clearParticipantSession();
    socketRef.current?.disconnect();
    router.push("/join");
  }

  function toggleOption(optionId: string) {
    if (!currentQuestion || answerResult || correctOptions.length > 0) {
      return;
    }

    const questionType = currentQuestion.question.type;

    if (questionType === "SINGLE_CHOICE") {
      setSelectedOptionIds([optionId]);
      return;
    }

    setSelectedOptionIds((currentSelectedIds) => {
      if (currentSelectedIds.includes(optionId)) {
        return currentSelectedIds.filter((id) => id !== optionId);
      }

      return [...currentSelectedIds, optionId];
    });
  }

  function isCorrectOption(optionId: string) {
    return correctOptions.some((option) => option.id === optionId);
  }

  function isSelectedOption(optionId: string) {
    return selectedOptionIds.includes(optionId);
  }

  function handleSubmitAnswer() {
    if (!socketRef.current || !participant || !currentQuestion) {
      return;
    }

    if (selectedOptionIds.length === 0) {
      setConnectionError("Выберите вариант ответа");
      return;
    }

    setConnectionError("");
    setIsSubmittingAnswer(true);

    socketRef.current.emit(
      "submit_answer",
      {
        sessionId,
        participantId: participant.id,
        questionId: currentQuestion.question.id,
        selectedOptionIds,
      },
      (response: {
        ok: boolean;
        message?: string;
        answer?: {
          id: string;
          isCorrect: boolean;
          pointsAwarded: number;
        };
      }) => {
        setIsSubmittingAnswer(false);

        if (!response.ok) {
          setConnectionError(response.message || "Не удалось отправить ответ");
        }
      }
    );
  }

  if (!participant || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="font-bold text-slate-700">Проверяем подключение...</p>
        </div>
      </main>
    );
  }

  const participantInLeaderboard = leaderboard.find(
    (item) => item.id === participant.id
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-3">
            <div
              className={`rounded-2xl px-4 py-2 text-sm font-bold ${
                isConnected
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {isConnected ? "Online" : "Offline"}
            </div>

            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLeave}
            >
              <ArrowLeft size={16} />
              Выйти
            </AppButton>
          </div>
        </header>

        {connectionError && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600">
            {connectionError}
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <UserRound size={22} className="mb-3 text-indigo-600" />
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-400">
              Участник
            </p>
            <p className="text-lg font-black text-slate-900">
              {participant.nickname}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <Trophy size={22} className="mb-3 text-amber-500" />
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-400">
              Баллы
            </p>
            <p className="text-lg font-black text-slate-900">
              {participantInLeaderboard?.score ?? participant.score}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <Clock size={22} className="mb-3 text-emerald-600" />
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-400">
              Статус
            </p>
            <p className="text-lg font-black text-slate-900">
              {isSessionFinished ? "FINISHED" : session.status}
            </p>
          </div>
        </section>

        {isSessionFinished ? (
          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50">
                <Trophy size={28} className="text-amber-500" />
              </div>

              <p className="mb-3 text-xs font-black uppercase tracking-widest text-amber-500">
                Quiz finished
              </p>

              <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
                Квиз завершён
              </h1>

              <p className="text-slate-500">
                Ниже финальный лидерборд участников.
              </p>
            </div>

            <LeaderboardList leaderboard={leaderboard} participantId={participant.id} />
          </section>
        ) : currentQuestion ? (
          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-widest text-indigo-600">
                  Вопрос {currentQuestion.question.order}
                </p>

                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                  {currentQuestion.question.text || "Вопрос с изображением"}
                </h1>
              </div>

              <div className="rounded-2xl bg-indigo-50 px-5 py-3 text-center">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-400">
                  Осталось
                </p>
                <p className="text-2xl font-black text-indigo-700">
                  {secondsLeft ?? currentQuestion.question.timeLimitSeconds}с
                </p>
              </div>
            </div>

            {currentQuestion.question.imageUrl && (
              <div className="mb-6 rounded-3xl bg-slate-50 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getBackendFileUrl(currentQuestion.question.imageUrl)}
                  alt="Изображение вопроса"
                  className="max-h-96 w-full rounded-2xl object-cover"
                />
              </div>
            )}

            <div className="mb-6 grid gap-3">
              {currentQuestion.question.options.map((option) => {
                const selected = isSelectedOption(option.id);
                const correct = isCorrectOption(option.id);
                const showCorrectState = correctOptions.length > 0;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOption(option.id)}
                    disabled={Boolean(answerResult) || showCorrectState}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                      showCorrectState && correct
                        ? "border-emerald-300 bg-emerald-50"
                        : showCorrectState && selected && !correct
                        ? "border-rose-300 bg-rose-50"
                        : selected
                        ? "border-indigo-400 bg-indigo-50"
                        : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/50"
                    }`}
                  >
                    {showCorrectState && correct ? (
                      <CheckCircle2 size={20} className="text-emerald-600" />
                    ) : showCorrectState && selected && !correct ? (
                      <XCircle size={20} className="text-rose-500" />
                    ) : selected ? (
                      <CheckCircle2 size={20} className="text-indigo-600" />
                    ) : (
                      <Circle size={20} className="text-slate-400" />
                    )}

                    <span className="font-bold text-slate-800">
                      {option.text || "Вариант с изображением"}
                    </span>

                    {option.imageUrl && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getBackendFileUrl(option.imageUrl)}
                          alt="Изображение варианта ответа"
                          className="ml-auto h-16 w-24 rounded-xl object-cover"
                        />
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {answerResult && (
              <div
                className={`mb-6 rounded-2xl p-4 text-sm font-bold ${
                  answerResult.isCorrect
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {answerResult.isCorrect
                  ? `Ответ принят: правильно, +${answerResult.pointsAwarded} баллов`
                  : "Ответ принят: неправильно"}
              </div>
            )}

            {correctOptions.length > 0 && (
              <div className="mb-6 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                Вопрос завершён. Причина:{" "}
                <span className="font-black">{questionFinishedReason}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <AppButton
                type="button"
                size="lg"
                onClick={handleSubmitAnswer}
                disabled={
                  selectedOptionIds.length === 0 ||
                  isSubmittingAnswer ||
                  Boolean(answerResult) ||
                  correctOptions.length > 0
                }
              >
                {isSubmittingAnswer ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {isSubmittingAnswer ? "Отправляем..." : "Ответить"}
              </AppButton>

              {currentQuestion.question.type === "MULTIPLE_CHOICE" && (
                <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
                  Можно выбрать несколько вариантов
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50">
              <Clock size={28} className="text-indigo-600" />
            </div>

            <p className="mb-3 text-xs font-black uppercase tracking-widest text-indigo-600">
              Waiting room
            </p>

            <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
              Ожидаем вопрос
            </h1>

            <p className="text-slate-500">
              Организатор скоро начнёт игру или покажет следующий вопрос.
            </p>
          </section>
        )}

        {leaderboard.length > 0 && !isSessionFinished && (
          <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-black text-slate-900">
              Лидерборд
            </h2>

            <LeaderboardList leaderboard={leaderboard} participantId={participant.id} />
          </section>
        )}
      </div>
    </main>
  );
}

function LeaderboardList({
  leaderboard,
  participantId,
}: {
  leaderboard: LeaderboardItem[];
  participantId: string;
}) {
  if (leaderboard.length === 0) {
    return (
      <p className="text-center font-semibold text-slate-500">
        Лидерборд пока пуст.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {leaderboard.map((item) => {
        const isCurrentParticipant = item.id === participantId;

        return (
          <div
            key={item.id}
            className={`flex items-center justify-between rounded-2xl p-4 ${
              isCurrentParticipant ? "bg-indigo-50" : "bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black ${
                  item.place === 1
                    ? "bg-amber-100 text-amber-600"
                    : "bg-white text-slate-500"
                }`}
              >
                #{item.place}
              </div>

              <div>
                <p className="font-black text-slate-900">
                  {item.nickname}
                  {isCurrentParticipant && (
                    <span className="ml-2 text-xs font-black uppercase tracking-widest text-indigo-600">
                      вы
                    </span>
                  )}
                </p>

                <p className="text-xs font-semibold text-slate-500">
                  Правильных ответов: {item.correctAnswersCount}/
                  {item.totalAnswersCount}
                </p>
              </div>
            </div>

            <p className="text-xl font-black text-slate-900">{item.score}</p>
          </div>
        );
      })}
    </div>
  );
}