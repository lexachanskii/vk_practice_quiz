"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Medal,
  RefreshCw,
  Trophy,
  Users,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { Logo } from "@/components/layout/Logo";
import { clearAuth, getCurrentUser, getToken } from "@/lib/auth";
import { getSessionResults } from "@/lib/results";
import type { SessionResultsResponse } from "@/types/quiz";

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();

  const sessionId = String(params.sessionId);

  const [results, setResults] = useState<SessionResultsResponse | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [error, setError] = useState("");

  async function loadResults() {
    setError("");
    setIsLoadingResults(true);

    try {
      const data = await getSessionResults(sessionId);
      setResults(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить результаты"
      );
    } finally {
      setIsLoadingResults(false);
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

        await loadResults();
      } catch {
        clearAuth();
        router.replace("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuth();
  }, [router, sessionId]);

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="font-bold text-slate-700">Проверяем авторизацию...</p>
        </div>
      </main>
    );
  }

  const leaderboard = results?.leaderboard ?? [];
  const winner = results?.winner ?? leaderboard[0] ?? null;

  const participantsCount =
    results?.stats?.participantsCount ??
    results?.participantsCount ??
    leaderboard.length;

  const averageScore =
    results?.stats?.averageScore ??
    results?.averageScore ??
    (leaderboard.length > 0
      ? leaderboard.reduce((sum, item) => sum + item.score, 0) /
        leaderboard.length
      : 0);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <Logo />

          <div className="flex gap-3">
            <AppButton href="/organizer" variant="secondary" size="sm">
              <ArrowLeft size={16} />
              Кабинет
            </AppButton>

            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={loadResults}
              disabled={isLoadingResults}
            >
              <RefreshCw size={16} />
              Обновить
            </AppButton>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        {isLoadingResults && !results ? (
          <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="font-bold text-slate-700">
              Загружаем результаты...
            </p>
          </section>
        ) : !results ? (
          <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <h1 className="mb-3 text-2xl font-black text-slate-900">
              Результаты не найдены
            </h1>

            <p className="mb-6 text-slate-500">
              Возможно, сессия ещё не завершена или указан неверный sessionId.
            </p>

            <AppButton href="/organizer" variant="secondary">
              Вернуться в кабинет
            </AppButton>
          </section>
        ) : (
          <>
            <section className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-indigo-600">
                Session results
              </p>

              <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
                Результаты квиза
              </h1>

              <p className="break-all text-sm font-semibold text-slate-500">
                Session ID: {sessionId}
              </p>
            </section>

            {winner && (
              <section className="mb-8 rounded-[2rem] bg-slate-950 p-8 text-center text-white shadow-sm">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-amber-400/20">
                  <Trophy size={36} className="text-amber-300" />
                </div>

                <p className="mb-3 text-xs font-black uppercase tracking-widest text-amber-300">
                  Победитель
                </p>

                <h2 className="mb-2 text-4xl font-black tracking-tight">
                  {winner.nickname}
                </h2>

                <p className="text-2xl font-black text-amber-300">
                  {winner.score} баллов
                </p>
              </section>
            )}

            <section className="mb-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <Users size={24} className="mb-3 text-indigo-600" />
                <p className="text-3xl font-black text-slate-900">
                  {participantsCount}
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  участников
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <BarChart3 size={24} className="mb-3 text-emerald-600" />
                <p className="text-3xl font-black text-slate-900">
                  {Math.round(averageScore)}
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  средний балл
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <Medal size={24} className="mb-3 text-amber-500" />
                <p className="text-3xl font-black text-slate-900">
                  {leaderboard[0]?.score ?? 0}
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  лучший результат
                </p>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-3xl font-black tracking-tight text-slate-900">
                Лидерборд
              </h2>

              {leaderboard.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center">
                  <h3 className="mb-2 text-2xl font-black text-slate-900">
                    Ответов пока нет
                  </h3>

                  <p className="text-slate-500">
                    Когда участники ответят на вопросы, результаты появятся
                    здесь.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {leaderboard.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between rounded-2xl p-4 ${
                        item.place === 1 ? "bg-amber-50" : "bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black ${
                            item.place === 1
                              ? "bg-amber-100 text-amber-600"
                              : "bg-white text-slate-500"
                          }`}
                        >
                          #{item.place}
                        </div>

                        <div>
                          <p className="text-lg font-black text-slate-900">
                            {item.nickname}
                          </p>

                          <p className="flex items-center gap-1 text-sm font-semibold text-slate-500">
                            <CheckCircle2 size={15} />
                            Правильных ответов: {item.correctAnswersCount}/
                            {item.totalAnswersCount}
                          </p>
                        </div>
                      </div>

                      <p className="text-2xl font-black text-slate-900">
                        {item.score}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}