"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Play, Users } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { Logo } from "@/components/layout/Logo";
import { clearAuth, getCurrentUser, getToken } from "@/lib/auth";
import { getQuizById } from "@/lib/quizzes";
import { startQuizSession } from "@/lib/sessions";
import type { FullQuiz, QuizSession } from "@/types/quiz";

export default function LaunchQuizPage() {
  const router = useRouter();
  const params = useParams();

  const quizId = String(params.quizId);

  const [quiz, setQuiz] = useState<FullQuiz | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadQuiz() {
    setError("");
    setIsLoadingQuiz(true);

    try {
      const data = await getQuizById(quizId);
      setQuiz(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить квиз");
    } finally {
      setIsLoadingQuiz(false);
    }
  }

  useEffect(() => {
    async function checkAuth() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const user = await getCurrentUser();

        if (user.role !== "ORGANIZER") {
          router.replace("/join");
          return;
        }

        await loadQuiz();
      } catch {
        clearAuth();
        router.replace("/login");
        return;
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuth();
  }, [router, quizId]);

  async function handleStartSession() {
    setError("");
    setIsStarting(true);

    try {
      const createdSession = await startQuizSession(quizId);
      setSession(createdSession);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось создать комнату");
    } finally {
      setIsStarting(false);
    }
  }

  async function handleCopyRoomCode() {
    if (!session?.roomCode) {
      return;
    }

    await navigator.clipboard.writeText(session.roomCode);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="font-bold text-slate-700">Проверяем авторизацию...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between">
          <Logo />

          <div className="flex gap-3">
            <AppButton href={`/organizer/quizzes/${quizId}`} variant="secondary" size="sm">
              <ArrowLeft size={16} />
              К квизу
            </AppButton>

            <AppButton href="/organizer" variant="ghost" size="sm">
              Кабинет
            </AppButton>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        {isLoadingQuiz && !quiz ? (
          <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="font-bold text-slate-700">Загружаем квиз...</p>
          </section>
        ) : !quiz ? (
          <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <h1 className="mb-2 text-2xl font-black text-slate-900">
              Квиз не найден
            </h1>

            <AppButton href="/organizer" variant="secondary">
              Вернуться в кабинет
            </AppButton>
          </section>
        ) : (
          <>
            <section className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-indigo-600">
                Launch room
              </p>

              <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
                Запуск комнаты
              </h1>

              <p className="mb-8 max-w-3xl text-slate-600">
                Вы запускаете квиз: <span className="font-bold">{quiz.title}</span>.
                После создания комнаты участники смогут подключиться по коду.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-2xl font-black text-slate-900">
                    {quiz.questions.length}
                  </p>
                  <p className="text-sm font-semibold text-slate-500">
                    вопросов
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-2xl font-black text-slate-900">
                    {quiz.defaultTimeLimitSeconds} сек.
                  </p>
                  <p className="text-sm font-semibold text-slate-500">
                    время по умолчанию
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-2xl font-black text-slate-900">
                    {quiz.pointsPerQuestion}
                  </p>
                  <p className="text-sm font-semibold text-slate-500">
                    баллов за вопрос
                  </p>
                </div>
              </div>
            </section>

            {!session ? (
              <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50">
                  <Play size={28} className="text-indigo-600" />
                </div>

                <h2 className="mb-3 text-3xl font-black text-slate-900">
                  Создать комнату?
                </h2>

                <p className="mx-auto mb-6 max-w-xl text-slate-500">
                  Backend создаст новую сессию квиза и сгенерирует код комнаты.
                  После этого участники смогут вводить этот код на странице подключения.
                </p>

                <AppButton
                  type="button"
                  size="lg"
                  onClick={handleStartSession}
                  disabled={isStarting || quiz.questions.length === 0}
                >
                  <Play size={18} />
                  {isStarting ? "Создаём комнату..." : "Создать комнату"}
                </AppButton>

                {quiz.questions.length === 0 && (
                  <p className="mt-4 text-sm font-semibold text-rose-500">
                    Перед запуском нужно добавить хотя бы один вопрос.
                  </p>
                )}
              </section>
            ) : (
              <section className="rounded-3xl bg-white p-8 shadow-sm">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50">
                    <Users size={28} className="text-emerald-600" />
                  </div>

                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-emerald-600">
                    Комната создана
                  </p>

                  <h2 className="mb-3 text-3xl font-black text-slate-900">
                    Участники могут подключаться
                  </h2>

                  <p className="text-slate-500">
                    Покажите этот код участникам или отправьте им его.
                  </p>
                </div>

                <div className="mx-auto mb-8 max-w-md rounded-[2rem] bg-slate-950 p-8 text-center text-white">
                  <p className="mb-4 text-xs font-black uppercase tracking-widest text-white/40">
                    Код комнаты
                  </p>

                  <p className="mb-6 text-6xl font-black tracking-[0.25em]">
                    {session.roomCode}
                  </p>

                  <button
                    type="button"
                    onClick={handleCopyRoomCode}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/20"
                  >
                    <Copy size={16} />
                    {copied ? "Скопировано" : "Скопировать код"}
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-400">
                      Session ID
                    </p>
                    <p className="break-all text-sm font-bold text-slate-700">
                      {session.id}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-400">
                      Статус
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {session.status}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <AppButton href="/join" variant="secondary" size="lg">
                    Страница участника
                  </AppButton>

                  <AppButton
                    href={`/organizer/sessions/${session.id}`}
                    size="lg"
                  >
                    Перейти к управлению игрой
                  </AppButton>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}