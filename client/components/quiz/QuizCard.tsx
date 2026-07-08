import { Clock, FileQuestion, Play, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import type { Quiz, QuizCategoryRelation, QuizStatus } from "@/types/quiz";

type QuizCardProps = {
  quiz: Quiz;
  onDelete: (quizId: string) => void;
};

function getStatusLabel(status: QuizStatus) {
  switch (status) {
    case "DRAFT":
      return "Черновик";
    case "PUBLISHED":
      return "Опубликован";
    case "ARCHIVED":
      return "Архив";
    default:
      return status;
  }
}

function getCategoryName(item: QuizCategoryRelation) {
  if (item.category?.name) {
    return item.category.name;
  }

  if (item.name) {
    return item.name;
  }

  return null;
}

export function QuizCard({ quiz, onDelete }: QuizCardProps) {
  const categories = quiz.categories
    ?.map(getCategoryName)
    .filter((name): name is string => Boolean(name));

  const questionsCount = quiz.questions?.length ?? 0;
  const sessionsCount = quiz.sessions?.length ?? 0;

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-indigo-600">
              {getStatusLabel(quiz.status)}
            </span>

            {categories?.map((category) => (
              <span
                key={category}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500"
              >
                {category}
              </span>
            ))}
          </div>

          <h2 className="mb-2 text-2xl font-black tracking-tight text-slate-900">
            {quiz.title}
          </h2>

          <p className="line-clamp-2 text-sm leading-6 text-slate-500">
            {quiz.description || "Описание квиза не добавлено."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDelete(quiz.id)}
          className="rounded-2xl p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
          aria-label="Удалить квиз"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <FileQuestion size={18} className="mb-2 text-indigo-600" />
          <p className="text-lg font-black text-slate-900">{questionsCount}</p>
          <p className="text-xs font-semibold text-slate-500">вопросов</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <Clock size={18} className="mb-2 text-indigo-600" />
          <p className="text-lg font-black text-slate-900">
            {quiz.defaultTimeLimitSeconds}с
          </p>
          <p className="text-xs font-semibold text-slate-500">на вопрос</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <Play size={18} className="mb-2 text-indigo-600" />
          <p className="text-lg font-black text-slate-900">{sessionsCount}</p>
          <p className="text-xs font-semibold text-slate-500">запусков</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <AppButton href={`/organizer/quizzes/${quiz.id}`} variant="secondary">
          Открыть
        </AppButton>

        <AppButton href={`/organizer/quizzes/${quiz.id}/launch`}>
          <Play size={16} />
          Запустить
        </AppButton>
      </div>
    </article>
  );
}