"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Logo } from "@/components/layout/Logo";
import { clearAuth, getCurrentUser, getToken } from "@/lib/auth";
import { createQuiz } from "@/lib/quizzes";

export default function NewQuizPage() {
  const router = useRouter();

  const [title, setTitle] = useState("Тестовый квиз");
  const [description, setDescription] = useState(
    "Квиз для проверки frontend и backend"
  );
  const [defaultTimeLimitSeconds, setDefaultTimeLimitSeconds] = useState(10);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(100);
  const [categoriesText, setCategoriesText] = useState("Frontend, Test");

  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      } catch {
        clearAuth();
        router.replace("/login");
        return;
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuth();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const categories = categoriesText
      .split(",")
      .map((category) => category.trim())
      .filter(Boolean);

    try {
      await createQuiz({
        title,
        description,
        defaultTimeLimitSeconds,
        pointsPerQuestion,
        categories,
      });

      router.push("/organizer");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось создать квиз");
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 flex items-center justify-between">
          <Logo />

          <AppButton href="/organizer" variant="secondary" size="sm">
            <ArrowLeft size={16} />
            Назад
          </AppButton>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-8 shadow-sm"
        >
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-indigo-600">
            Create quiz
          </p>

          <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
            Создание квиза
          </h1>

          <p className="mb-8 text-slate-500">
            Заполните основные настройки квиза. Вопросы добавим на следующем
            экране.
          </p>

          <div className="flex flex-col gap-5">
            <AppInput
              label="Название квиза"
              placeholder="Например: Основы JavaScript"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Описание
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Краткое описание квиза"
                rows={4}
                className="w-full resize-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <AppInput
                label="Время на вопрос, секунд"
                type="number"
                min={3}
                max={300}
                value={defaultTimeLimitSeconds}
                onChange={(event) =>
                  setDefaultTimeLimitSeconds(Number(event.target.value))
                }
                required
              />

              <AppInput
                label="Баллы за вопрос"
                type="number"
                min={1}
                max={10000}
                value={pointsPerQuestion}
                onChange={(event) =>
                  setPointsPerQuestion(Number(event.target.value))
                }
                required
              />
            </div>

            <AppInput
              label="Категории через запятую"
              placeholder="Frontend, JavaScript, React"
              value={categoriesText}
              onChange={(event) => setCategoriesText(event.target.value)}
            />

            {error && (
              <div className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-3">
              <AppButton type="submit" size="lg" disabled={isSubmitting}>
                <Plus size={18} />
                {isSubmitting ? "Создаём..." : "Создать квиз"}
              </AppButton>

              <AppButton href="/organizer" variant="ghost" size="lg">
                Отмена
              </AppButton>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}