"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Logo } from "@/components/layout/Logo";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { clearAuth, getCurrentUser, getToken } from "@/lib/auth";
import { createQuestion, deleteQuestion } from "@/lib/questions";
import { getQuizById } from "@/lib/quizzes";
import type { FullQuiz, QuestionType } from "@/types/quiz";

type DraftOption = {
  text: string;
  isCorrect: boolean;
};

export default function QuizDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const quizId = String(params.quizId);

  const [quiz, setQuiz] = useState<FullQuiz | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [questionText, setQuestionText] = useState("Тестовый вопрос");
  const [questionType, setQuestionType] =
    useState<QuestionType>("SINGLE_CHOICE");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(10);
  const [points, setPoints] = useState(100);
  const [options, setOptions] = useState<DraftOption[]>([
    { text: "Правильный ответ", isCorrect: true },
    { text: "Неправильный ответ", isCorrect: false },
  ]);

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

  function updateOptionText(index: number, text: string) {
    setOptions((currentOptions) =>
      currentOptions.map((option, optionIndex) =>
        optionIndex === index ? { ...option, text } : option
      )
    );
  }

  function toggleCorrectOption(index: number) {
    setOptions((currentOptions) => {
      if (questionType === "SINGLE_CHOICE") {
        return currentOptions.map((option, optionIndex) => ({
          ...option,
          isCorrect: optionIndex === index,
        }));
      }

      return currentOptions.map((option, optionIndex) =>
        optionIndex === index
          ? { ...option, isCorrect: !option.isCorrect }
          : option
      );
    });
  }

  function addOption() {
    setOptions((currentOptions) => [
      ...currentOptions,
      {
        text: "",
        isCorrect: false,
      },
    ]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) {
      setError("У вопроса должно быть минимум 2 варианта ответа");
      return;
    }

    setOptions((currentOptions) =>
      currentOptions.filter((_, optionIndex) => optionIndex !== index)
    );
  }

  function resetQuestionForm() {
    setQuestionText("Тестовый вопрос");
    setQuestionType("SINGLE_CHOICE");
    setTimeLimitSeconds(10);
    setPoints(100);
    setOptions([
      { text: "Правильный ответ", isCorrect: true },
      { text: "Неправильный ответ", isCorrect: false },
    ]);
  }

  async function handleCreateQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const preparedOptions = options
      .map((option) => ({
        text: option.text.trim(),
        isCorrect: option.isCorrect,
      }))
      .filter((option) => option.text.length > 0);

    if (!questionText.trim()) {
      setError("Введите текст вопроса");
      return;
    }

    if (preparedOptions.length < 2) {
      setError("Добавьте минимум 2 варианта ответа");
      return;
    }

    const correctOptionsCount = preparedOptions.filter(
      (option) => option.isCorrect
    ).length;

    if (questionType === "SINGLE_CHOICE" && correctOptionsCount !== 1) {
      setError("Для вопроса с одним ответом должен быть ровно 1 правильный вариант");
      return;
    }

    if (questionType === "MULTIPLE_CHOICE" && correctOptionsCount < 1) {
      setError("Для вопроса с несколькими ответами нужен хотя бы 1 правильный вариант");
      return;
    }

    setIsSubmitting(true);

    try {
      await createQuestion(quizId, {
        text: questionText.trim(),
        type: questionType,
        timeLimitSeconds,
        points,
        options: preparedOptions,
      });

      resetQuestionForm();
      await loadQuiz();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось создать вопрос");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    const confirmed = window.confirm("Удалить этот вопрос?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteQuestion(questionId);
      await loadQuiz();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось удалить вопрос");
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
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <Logo />

          <div className="flex gap-3">
            <AppButton href="/organizer" variant="secondary" size="sm">
              <ArrowLeft size={16} />
              Назад
            </AppButton>

            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={loadQuiz}
              disabled={isLoadingQuiz}
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
                Quiz details
              </p>

              <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
                {quiz.title}
              </h1>

              <p className="mb-6 max-w-3xl text-slate-600">
                {quiz.description || "Описание не добавлено."}
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-2xl font-black text-slate-900">
                    {quiz.questions?.length ?? 0}
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
                    баллов по умолчанию
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-indigo-600">
                Add question
              </p>

              <h2 className="mb-6 text-3xl font-black tracking-tight text-slate-900">
                Добавить вопрос
              </h2>

              <form onSubmit={handleCreateQuestion} className="flex flex-col gap-5">
                <AppInput
                  label="Текст вопроса"
                  value={questionText}
                  onChange={(event) => setQuestionText(event.target.value)}
                  required
                />

                <div className="grid gap-5 md:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Тип вопроса
                    </label>

                    <select
                      value={questionType}
                      onChange={(event) => {
                        const nextType = event.target.value as QuestionType;
                        setQuestionType(nextType);

                        if (nextType === "SINGLE_CHOICE") {
                          setOptions((currentOptions) =>
                            currentOptions.map((option, index) => ({
                              ...option,
                              isCorrect: index === 0,
                            }))
                          );
                        }
                      }}
                      className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="SINGLE_CHOICE">Один ответ</option>
                      <option value="MULTIPLE_CHOICE">Несколько ответов</option>
                    </select>
                  </div>

                  <AppInput
                    label="Время, секунд"
                    type="number"
                    min={3}
                    max={300}
                    value={timeLimitSeconds}
                    onChange={(event) =>
                      setTimeLimitSeconds(Number(event.target.value))
                    }
                    required
                  />

                  <AppInput
                    label="Баллы"
                    type="number"
                    min={1}
                    max={10000}
                    value={points}
                    onChange={(event) => setPoints(Number(event.target.value))}
                    required
                  />
                </div>

                <div className="rounded-3xl bg-slate-50 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-black text-slate-900">
                      Варианты ответа
                    </h3>

                    <AppButton type="button" variant="secondary" onClick={addOption}>
                      <Plus size={16} />
                      Добавить вариант
                    </AppButton>
                  </div>

                  <div className="grid gap-3">
                    {options.map((option, index) => (
                      <div
                        key={index}
                        className="grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-[1fr_auto_auto]"
                      >
                        <AppInput
                          placeholder={`Вариант ${index + 1}`}
                          value={option.text}
                          onChange={(event) =>
                            updateOptionText(index, event.target.value)
                          }
                        />

                        <button
                          type="button"
                          onClick={() => toggleCorrectOption(index)}
                          className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                            option.isCorrect
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {option.isCorrect ? "Правильный" : "Неправильный"}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100"
                        >
                          Удалить
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <AppButton type="submit" size="lg" disabled={isSubmitting}>
                    <Plus size={18} />
                    {isSubmitting ? "Добавляем..." : "Добавить вопрос"}
                  </AppButton>

                  <AppButton type="button" variant="ghost" size="lg" onClick={resetQuestionForm}>
                    Очистить форму
                  </AppButton>
                </div>
              </form>
            </section>

            <section className="grid gap-5">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Вопросы квиза
              </h2>

              {quiz.questions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <h3 className="mb-2 text-2xl font-black text-slate-900">
                    Пока нет вопросов
                  </h3>

                  <p className="text-slate-500">
                    Добавьте первый вопрос через форму выше.
                  </p>
                </div>
              ) : (
                quiz.questions
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onDelete={handleDeleteQuestion}
                    />
                  ))
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}