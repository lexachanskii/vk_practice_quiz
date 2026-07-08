"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Clock,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { Logo } from "@/components/layout/Logo";
import { clearAuth, getCurrentUser, getToken } from "@/lib/auth";
import { getMyOrganizedSessions } from "@/lib/sessions";
import type { OrganizerSessionHistoryItem } from "@/types/quiz";

function getStatusLabel(status: OrganizerSessionHistoryItem["status"]) {
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

export default function OrganizerHistoryPage() {
  const router = useRouter();

  const [sessions, setSessions] = useState<OrganizerSessionHistoryItem[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [error, setError] = useState("");

  async function loadSessions() {
    setError("");
    setIsLoadingSessions(true);

    try {
      const data = await getMyOrganizedSessions();
      setSessions(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить историю сессий"
      );
    } finally {
      setIsLoadingSessions(false);
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

        await loadSessions();
      } catch {
        clearAuth();
        router.replace("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuth();
  }, [router]);

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="font-bold text-slate-700">Проверяем авторизацию...</p>
        </div>
      </main>
    );
  }

  const finishedCount = sessions.filter(
    (session) => session.status === "FINISHED"
  ).length;

  const activeCount = sessions.filter(
    (session) => session.status === "ACTIVE" || session.status === "WAITING"
  ).length;

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
              onClick={loadSessions}
              disabled={isLoadingSessions}
            >
              <RefreshCw size={16} />
              Обновить
            </AppButton>
          </div>
        </header>

        <section className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-indigo-600">
            Session history
          </p>

          <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
            История проведённых сессий
          </h1>

          <p className="max-w-3xl text-slate-600">
            Здесь отображаются все комнаты, которые вы создавали для своих
            квизов.
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <BarChart3 size={24} className="mb-3 text-indigo-600" />
            <p className="text-3xl font-black text-slate-900">
              {sessions.length}
            </p>
            <p className="text-sm font-semibold text-slate-500">
              всего запусков
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <Trophy size={24} className="mb-3 text-amber-500" />
            <p className="text-3xl font-black text-slate-900">
              {finishedCount}
            </p>
            <p className="text-sm font-semibold text-slate-500">
              завершённых
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <Clock size={24} className="mb-3 text-emerald-600" />
            <p className="text-3xl font-black text-slate-900">
              {activeCount}
            </p>
            <p className="text-sm font-semibold text-slate-500">
              активных / ожидающих
            </p>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        {isLoadingSessions ? (
          <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="font-bold text-slate-700">Загружаем историю...</p>
          </section>
        ) : sessions.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="mb-3 text-2xl font-black text-slate-900">
              История пока пустая
            </h2>

            <p className="mb-6 text-slate-500">
              Создайте комнату для квиза, и она появится здесь.
            </p>

            <AppButton href="/organizer">Перейти к квизам</AppButton>
          </section>
        ) : (
          <section className="grid gap-5">
            {sessions.map((session) => (
              <article
                key={session.id}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-indigo-600">
                        {getStatusLabel(session.status)}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                        Код: {session.roomCode}
                      </span>
                    </div>

                    <h2 className="mb-2 text-2xl font-black tracking-tight text-slate-900">
                      {session.quiz.title}
                    </h2>

                    <p className="text-sm font-semibold text-slate-500">
                      Создана: {formatDate(session.createdAt)}
                    </p>

                    <p className="text-sm font-semibold text-slate-500">
                      Завершена: {formatDate(session.finishedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {session.status !== "FINISHED" && (
                      <AppButton
                        href={`/organizer/sessions/${session.id}`}
                        variant="secondary"
                      >
                        Управление
                      </AppButton>
                    )}

                    <AppButton href={`/results/${session.id}`}>
                      Результаты
                    </AppButton>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <Users size={20} className="mb-2 text-indigo-600" />
                    <p className="text-xl font-black text-slate-900">
                      {session.participantsCount}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      участников
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <BarChart3 size={20} className="mb-2 text-indigo-600" />
                    <p className="text-xl font-black text-slate-900">
                      {session.questionsCount}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      вопросов
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <Trophy size={20} className="mb-2 text-amber-500" />
                    <p className="text-xl font-black text-slate-900">
                      {session.winner?.nickname ?? "—"}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      победитель
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <BarChart3 size={20} className="mb-2 text-emerald-600" />
                    <p className="text-xl font-black text-slate-900">
                      {Math.round(session.averageScore)}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      средний балл
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