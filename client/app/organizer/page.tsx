"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { History, LogOut, Plus, RefreshCw, User } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { Logo } from "@/components/layout/Logo";
import { QuizCard } from "@/components/quiz/QuizCard";
import { clearAuth, getCurrentUser, getSavedUser, getToken } from "@/lib/auth";
import { deleteQuiz, getMyQuizzes } from "@/lib/quizzes";
import type { AuthUser } from "@/types/auth";
import type { Quiz } from "@/types/quiz";

export default function OrganizerPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(getSavedUser());
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isQuizzesLoading, setIsQuizzesLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadQuizzes() {
    setError("");
    setIsQuizzesLoading(true);

    try {
      const data = await getMyQuizzes();
      setQuizzes(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Не удалось загрузить квизы"
      );
    } finally {
      setIsQuizzesLoading(false);
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
        const currentUser = await getCurrentUser();

        if (currentUser.role !== "ORGANIZER") {
          router.replace("/join");
          return;
        }

        setUser(currentUser);
        await loadQuizzes();
      } catch {
        clearAuth();
        router.replace("/login");
      } finally {
        setIsAuthLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.push("/");
  }

  async function handleDeleteQuiz(quizId: string) {
    const confirmed = window.confirm(
      "Удалить этот квиз? Вместе с ним удалятся вопросы и связанные данные."
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteQuiz(quizId);
      setQuizzes((currentQuizzes) =>
        currentQuizzes.filter((quiz) => quiz.id !== quizId)
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось удалить квиз");
    }
  }

  if (isAuthLoading) {
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
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-sm sm:flex">
              <User size={16} className="text-indigo-600" />
              <span className="text-sm font-bold text-slate-700">
                {user?.name || user?.email}
              </span>
            </div>

            <AppButton variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} />
              Выйти
            </AppButton>
          </div>
        </header>

        <section className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-indigo-600">
                Organizer dashboard
              </p>

              <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
                Кабинет организатора
              </h1>

              <p className="max-w-2xl text-slate-600">
                Здесь отображаются ваши реальные квизы из базы данных.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <AppButton
                type="button"
                variant="secondary"
                size="lg"
                onClick={loadQuizzes}
                disabled={isQuizzesLoading}
              >
                <RefreshCw size={18} />
                Обновить
              </AppButton>

              <AppButton href="/organizer/history" variant="secondary" size="lg">
                <History size={18} />
                История
              </AppButton>

              <AppButton href="/organizer/quizzes/new" size="lg">
                <Plus size={18} />
                Создать квиз
              </AppButton>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        {isQuizzesLoading ? (
          <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="font-bold text-slate-700">Загружаем квизы...</p>
          </section>
        ) : quizzes.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="mb-3 text-2xl font-black text-slate-900">
              Пока нет квизов
            </h2>

            <p className="mx-auto mb-6 max-w-xl text-slate-500">
              Создайте первый квиз, добавьте вопросы и запустите комнату для
              участников.
            </p>

            <AppButton href="/organizer/quizzes/new" size="lg">
              <Plus size={18} />
              Создать первый квиз
            </AppButton>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onDelete={handleDeleteQuiz}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}