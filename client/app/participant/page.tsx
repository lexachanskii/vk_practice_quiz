"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  LogOut,
  Play,
  RefreshCw,
  Trophy,
  UserRound,
} from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { Logo } from "@/components/layout/Logo";
import { clearAuth, getCurrentUser, getToken } from "@/lib/auth";
import { getMyParticipations } from "@/lib/sessions";
import type { ParticipantHistoryItem } from "@/types/quiz";

function getStatusLabel(status: ParticipantHistoryItem["session"]["status"]) {
  switch (status) {
    case "WAITING":
      return "Ожидание";
    case "ACTIVE":
      return "Активна";
    case "FINISHED":
      return "Завершена";
    case "CANCELLED":
      return "Отменена";
    default:
      return status;
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ParticipantPage() {
  const router = useRouter();

  const [participations, setParticipations] = useState<
    ParticipantHistoryItem[]
  >([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState("");

  async function loadHistory() {
    setError("");
    setIsLoadingHistory(true);

    try {
      const data = await getMyParticipations();
      setParticipations(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить историю участника"
      );
    } finally {
      setIsLoadingHistory(false);
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

        if (user.role !== "PARTICIPANT") {
          router.replace("/organizer");
          return;
        }

        await loadHistory();
      } catch {
        clearAuth();
        router.replace("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuth();
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.push("/");
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

  const finishedCount = participations.filter(
    (item) => item.session.status === "FINISHED"
  ).length;

  const totalScore = participations.reduce((sum, item) => sum + item.score, 0);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <Logo />

          <div className="flex gap-3">
            <AppButton href="/" variant="secondary" size="sm">
              <ArrowLeft size={16} />
              Главная
            </AppButton>

            <AppButton type="button" variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} />
              Выйти
            </AppButton>
          </div>
        </header>

        <section className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-indigo-600">
                Participant dashboard
              </p>

              <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
                Кабинет участника
              </h1>

              <p className="max-w-3xl text-slate-600">
                Здесь отображается история квизов, в которых вы участвовали
                после входа в аккаунт.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <AppButton
                type="button"
                variant="secondary"
                size="lg"
                onClick={loadHistory}
                disabled={isLoadingHistory}
              >
                <RefreshCw size={18} />
                Обновить
              </AppButton>

              <AppButton href="/join" size="lg">
                <Play size={18} />
                Войти в квиз
              </AppButton>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <UserRound size={24} className="mb-3 text-indigo-600" />
            <p className="text-3xl font-black text-slate-900">
              {participations.length}
            </p>
            <p className="text-sm font-semibold text-slate-500">
              участий
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <Trophy size={24} className="mb-3 text-amber-500" />
            <p className="text-3xl font-black text-slate-900">
              {finishedCount}
            </p>
            <p className="text-sm font-semibold text-slate-500">
              завершённых квизов
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <Trophy size={24} className="mb-3 text-emerald-600" />
            <p className="text-3xl font-black text-slate-900">
              {totalScore}
            </p>
            <p className="text-sm font-semibold text-slate-500">
              всего баллов
            </p>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        {isLoadingHistory ? (
          <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="font-bold text-slate-700">Загружаем историю...</p>
          </section>
        ) : participations.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="mb-3 text-2xl font-black text-slate-900">
              История пока пустая
            </h2>

            <p className="mb-6 text-slate-500">
              Войдите в квиз по коду после авторизации, и участие появится здесь.
            </p>

            <AppButton href="/join" size="lg">
              <Play size={18} />
              Войти в первый квиз
            </AppButton>
          </section>
        ) : (
          <section className="grid gap-5">
            {participations.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-indigo-600">
                        {getStatusLabel(item.session.status)}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                        Код: {item.session.roomCode}
                      </span>

                      {item.place && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
                          Место: #{item.place}
                        </span>
                      )}
                    </div>

                    <h2 className="mb-2 text-2xl font-black tracking-tight text-slate-900">
                      {item.session.quiz.title}
                    </h2>

                    <p className="text-sm font-semibold text-slate-500">
                      Дата: {formatDate(item.session.createdAt)}
                    </p>

                    <p className="text-sm font-semibold text-slate-500">
                      Никнейм: {item.nickname}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {item.session.status !== "FINISHED" ? (
                      <AppButton href={`/play/${item.session.id}`} variant="secondary">
                        Вернуться в игру
                      </AppButton>
                    ) : (
                      <AppButton href={`/results/${item.session.id}`}>
                        Результаты
                      </AppButton>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <Trophy size={20} className="mb-2 text-amber-500" />
                    <p className="text-xl font-black text-slate-900">
                      {item.score}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      баллов
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <Clock size={20} className="mb-2 text-indigo-600" />
                    <p className="text-xl font-black text-slate-900">
                      {item.correctAnswersCount}/{item.totalAnswersCount}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      правильных
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <UserRound size={20} className="mb-2 text-emerald-600" />
                    <p className="text-xl font-black text-slate-900">
                      {item.session.questionsCount}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      вопросов в квизе
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <Trophy size={20} className="mb-2 text-indigo-600" />
                    <p className="text-xl font-black text-slate-900">
                      {item.place ? `#${item.place}` : "—"}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      место
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}