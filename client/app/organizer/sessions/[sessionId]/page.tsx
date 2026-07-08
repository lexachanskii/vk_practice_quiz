"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  Play,
  Radio,
  Send,
  Square,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import type { Socket } from "socket.io-client";
import { AppButton } from "@/components/ui/AppButton";
import { Logo } from "@/components/layout/Logo";
import { getBackendFileUrl } from "@/lib/api";
import { clearAuth, getSavedUser, getToken } from "@/lib/auth";
import { createSocket } from "@/lib/socket";
import type { AuthUser } from "@/types/auth";
import type {
  AnswerReceivedPayload,
  CorrectOption,
  LeaderboardItem,
  LeaderboardUpdatedPayload,
  ParticipantJoinedPayload,
  QuestionFinishedPayload,
  QuestionStartedPayload,
  SessionFinishedPayload,
  SessionStartedPayload,
} from "@/types/socket";

type SessionStatus = "WAITING" | "ACTIVE" | "FINISHED" | "CANCELLED";

export default function OrganizerSessionPage() {
  const router = useRouter();
  const params = useParams();

  const sessionId = String(params.sessionId);
  const socketRef = useRef<Socket | null>(null);

  const [user] = useState<AuthUser | null>(() => getSavedUser());
  const [token] = useState<string | null>(() => getToken());

  const [isConnected, setIsConnected] = useState(false);
  const [isJoiningSocket, setIsJoiningSocket] = useState(true);
  const [connectionError, setConnectionError] = useState("");

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("WAITING");
  const [currentQuestion, setCurrentQuestion] =
    useState<QuestionStartedPayload | null>(null);
  const [correctOptions, setCorrectOptions] = useState<CorrectOption[]>([]);
  const [questionFinishedReason, setQuestionFinishedReason] = useState("");

  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [participants, setParticipants] = useState<
    { id: string; nickname: string; score: number }[]
  >([]);

  const [answerEvents, setAnswerEvents] = useState<AnswerReceivedPayload[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "ORGANIZER") {
      router.replace("/join");
      return;
    }

    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError("");

      socket.emit(
        "organizer_join_session",
        {
          sessionId,
          token,
        },
        (response: { ok: boolean; message?: string }) => {
          setIsJoiningSocket(false);

          if (!response.ok) {
            setConnectionError(
              response.message || "Не удалось подключиться к сессии"
            );
          }
        }
      );
    });

    socket.on("connect_error", (error) => {
      setIsConnected(false);
      setIsJoiningSocket(false);
      setConnectionError(error.message);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("participant_joined", (payload: ParticipantJoinedPayload) => {
      setParticipants((currentParticipants) => {
        const alreadyExists = currentParticipants.some(
          (participant) => participant.id === payload.participant.id
        );

        if (alreadyExists) {
          return currentParticipants;
        }

        return [...currentParticipants, payload.participant];
      });
    });

    socket.on("session_started", (payload: SessionStartedPayload) => {
      setSessionStatus(payload.session.status);
    });

    socket.on("question_started", (payload: QuestionStartedPayload) => {
      setCurrentQuestion(payload);
      setCorrectOptions([]);
      setQuestionFinishedReason("");
      setAnswerEvents([]);
    });

    socket.on("answer_received", (payload: AnswerReceivedPayload) => {
      setAnswerEvents((currentEvents) => [payload, ...currentEvents]);
    });

    socket.on("question_finished", (payload: QuestionFinishedPayload) => {
      setCorrectOptions(payload.correctOptions);
      setQuestionFinishedReason(payload.reason);
    });

    socket.on("leaderboard_updated", (payload: LeaderboardUpdatedPayload) => {
      setLeaderboard(payload.leaderboard);

      setParticipants(
        payload.leaderboard.map((item) => ({
          id: item.id,
          nickname: item.nickname,
          score: item.score,
        }))
      );
    });

    socket.on("session_finished", (payload: SessionFinishedPayload) => {
      setIsSessionFinished(true);
      setSessionStatus("FINISHED");
      setCurrentQuestion(null);
      setCorrectOptions([]);
      setLeaderboard(payload.leaderboard);
    });

    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [router, sessionId, token, user]);

  function handleLogout() {
    clearAuth();
    socketRef.current?.disconnect();
    router.push("/");
  }

  function emitOrganizerAction(
    eventName: "start_session" | "show_question" | "finish_question" | "finish_session",
    payloadExtra: Record<string, unknown> = {}
  ) {
    if (!socketRef.current || !token) {
      setConnectionError("Socket не подключён или отсутствует token");
      return;
    }

    setConnectionError("");
    setIsActionLoading(true);

    socketRef.current.emit(
      eventName,
      {
        sessionId,
        token,
        ...payloadExtra,
      },
      (response: { ok: boolean; message?: string }) => {
        setIsActionLoading(false);

        if (!response.ok) {
          setConnectionError(response.message || "Действие не выполнено");
        }
      }
    );
  }

  function handleStartSession() {
    emitOrganizerAction("start_session");
  }

  function handleShowQuestion() {
    emitOrganizerAction("show_question");
  }

  function handleFinishQuestion() {
    if (!currentQuestion) {
      setConnectionError("Сейчас нет активного вопроса");
      return;
    }

    emitOrganizerAction("finish_question", {
      questionId: currentQuestion.question.id,
    });
  }

  function handleFinishSession() {
    const confirmed = window.confirm("Завершить весь квиз?");

    if (!confirmed) {
      return;
    }

    emitOrganizerAction("finish_session");
  }

  const activeQuestionFinished = correctOptions.length > 0;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
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

            <AppButton href="/organizer" variant="secondary" size="sm">
              <ArrowLeft size={16} />
              Кабинет
            </AppButton>

            <AppButton type="button" variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} />
              Выйти
            </AppButton>
          </div>
        </header>

        {connectionError && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600">
            {connectionError}
          </div>
        )}

        {isJoiningSocket && (
          <div className="mb-6 rounded-2xl bg-indigo-50 p-4 text-sm font-semibold text-indigo-700">
            Подключаем организатора к Socket.IO-сессии...
          </div>
        )}

        <section className="mb-6 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-indigo-600">
                Organizer live control
              </p>

              <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
                Управление игрой
              </h1>

              <p className="break-all text-sm font-semibold text-slate-500">
                Session ID: {sessionId}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-5 py-4">
              <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-400">
                Статус
              </p>
              <p className="text-2xl font-black text-slate-900">
                {sessionStatus}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <AppButton
            type="button"
            size="lg"
            onClick={handleStartSession}
            disabled={
              isActionLoading ||
              sessionStatus !== "WAITING" ||
              isSessionFinished
            }
          >
            {isActionLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Play size={18} />
            )}
            Начать игру
          </AppButton>

          <AppButton
            type="button"
            size="lg"
            variant="success"
            onClick={handleShowQuestion}
            disabled={
              isActionLoading ||
              sessionStatus !== "ACTIVE" ||
              Boolean(currentQuestion && !activeQuestionFinished) ||
              isSessionFinished
            }
          >
            <Send size={18} />
            Показать вопрос
          </AppButton>

          <AppButton
            type="button"
            size="lg"
            variant="secondary"
            onClick={handleFinishQuestion}
            disabled={
              isActionLoading ||
              !currentQuestion ||
              activeQuestionFinished ||
              isSessionFinished
            }
          >
            <Square size={18} />
            Завершить вопрос
          </AppButton>

          <AppButton
            type="button"
            size="lg"
            variant="danger"
            onClick={handleFinishSession}
            disabled={isActionLoading || isSessionFinished}
          >
            <XCircle size={18} />
            Завершить квиз
          </AppButton>
            {isSessionFinished && (
            <AppButton href={`/results/${sessionId}`} size="lg" variant="secondary">
                <Trophy size={18} />
                Итоговые результаты
            </AppButton>
            )}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="grid gap-6">
            <CurrentQuestionPanel
              currentQuestion={currentQuestion}
              correctOptions={correctOptions}
              questionFinishedReason={questionFinishedReason}
            />

            <AnswerEventsPanel
              answerEvents={answerEvents}
              leaderboard={leaderboard}
            />
          </div>

          <div className="grid gap-6">
            <ParticipantsPanel participants={participants} />

            <LeaderboardPanel leaderboard={leaderboard} />
          </div>
        </div>
      </div>
    </main>
  );
}

function CurrentQuestionPanel({
  currentQuestion,
  correctOptions,
  questionFinishedReason,
}: {
  currentQuestion: QuestionStartedPayload | null;
  correctOptions: CorrectOption[];
  questionFinishedReason: string;
}) {
  if (!currentQuestion) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50">
          <Radio size={28} className="text-indigo-600" />
        </div>

        <h2 className="mb-3 text-3xl font-black text-slate-900">
          Активного вопроса нет
        </h2>

        <p className="text-slate-500">
          Нажмите “Показать вопрос”, когда будете готовы вывести следующий
          вопрос участникам.
        </p>
      </section>
    );
  }

  const correctOptionIds = new Set(correctOptions.map((option) => option.id));

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-indigo-600">
            Вопрос {currentQuestion.question.order}
          </p>

          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            {currentQuestion.question.text || "Вопрос с изображением"}
          </h2>
        </div>

        <div className="rounded-2xl bg-indigo-50 px-5 py-3">
          <Clock size={20} className="mb-1 text-indigo-600" />
          <p className="text-sm font-black text-indigo-700">
            {currentQuestion.question.timeLimitSeconds} сек.
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

      <div className="grid gap-3">
        {currentQuestion.question.options.map((option) => {
          const isCorrect = correctOptionIds.has(option.id);

          return (
            <div
              key={option.id}
              className={`flex items-center gap-3 rounded-2xl border p-4 ${
                isCorrect
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 size={20} className="text-emerald-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
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
            </div>
          );
        })}
      </div>

      {correctOptions.length > 0 && (
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          Вопрос завершён. Причина:{" "}
          <span className="font-black">{questionFinishedReason}</span>
        </div>
      )}
    </section>
  );
}

function AnswerEventsPanel({
  answerEvents,
  leaderboard,
}: {
  answerEvents: AnswerReceivedPayload[];
  leaderboard: LeaderboardItem[];
}) {
  function getNickname(participantId: string) {
    return (
      leaderboard.find((item) => item.id === participantId)?.nickname ||
      participantId
    );
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-black text-slate-900">
        Последние ответы
      </h2>

      {answerEvents.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Пока никто не ответил на текущий вопрос.
        </p>
      ) : (
        <div className="grid gap-3">
          {answerEvents.map((event, index) => (
            <div
              key={`${event.participantId}-${event.questionId}-${index}`}
              className={`flex items-center justify-between rounded-2xl p-4 ${
                event.isCorrect ? "bg-emerald-50" : "bg-rose-50"
              }`}
            >
              <p className="font-bold text-slate-800">
                {getNickname(event.participantId)}
              </p>

              <div className="flex items-center gap-2">
                {event.isCorrect ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                  <XCircle size={18} className="text-rose-500" />
                )}

                <span
                  className={`text-sm font-black ${
                    event.isCorrect ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {event.isCorrect ? "верно" : "ошибка"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ParticipantsPanel({
  participants,
}: {
  participants: { id: string; nickname: string; score: number }[];
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Users size={22} className="text-indigo-600" />
        <h2 className="text-2xl font-black text-slate-900">
          Участники
        </h2>
      </div>

      {participants.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Участники ещё не подключились.
        </p>
      ) : (
        <div className="grid gap-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
            >
              <p className="font-bold text-slate-800">
                {participant.nickname}
              </p>

              <p className="font-black text-slate-900">
                {participant.score}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function LeaderboardPanel({
  leaderboard,
}: {
  leaderboard: LeaderboardItem[];
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Trophy size={22} className="text-amber-500" />
        <h2 className="text-2xl font-black text-slate-900">
          Лидерборд
        </h2>
      </div>

      {leaderboard.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Лидерборд пока пуст.
        </p>
      ) : (
        <div className="grid gap-3">
          {leaderboard.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-black ${
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
                  </p>

                  <p className="text-xs font-semibold text-slate-500">
                    Верно: {item.correctAnswersCount}/{item.totalAnswersCount}
                  </p>
                </div>
              </div>

              <p className="text-xl font-black text-slate-900">
                {item.score}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}