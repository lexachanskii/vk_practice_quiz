import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import type { FullQuestion } from "@/types/quiz";

type QuestionCardProps = {
  question: FullQuestion;
  onDelete: (questionId: string) => void;
};

function getQuestionTypeLabel(type: FullQuestion["type"]) {
  if (type === "SINGLE_CHOICE") {
    return "Один ответ";
  }

  return "Несколько ответов";
}

export function QuestionCard({ question, onDelete }: QuestionCardProps) {
  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-indigo-600">
              Вопрос {question.order}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
              {getQuestionTypeLabel(question.type)}
            </span>

            {question.timeLimitSeconds && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                {question.timeLimitSeconds} сек.
              </span>
            )}

            {question.points && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                {question.points} баллов
              </span>
            )}
          </div>

          <h3 className="text-xl font-black tracking-tight text-slate-900">
            {question.text || "Вопрос без текста"}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => onDelete(question.id)}
          className="rounded-2xl p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
          aria-label="Удалить вопрос"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="grid gap-3">
        {question.options.map((option) => (
          <div
            key={option.id}
            className={`flex items-center gap-3 rounded-2xl border p-4 ${
              option.isCorrect
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-100 bg-slate-50"
            }`}
          >
            {option.isCorrect ? (
              <CheckCircle2 size={18} className="text-emerald-600" />
            ) : (
              <Circle size={18} className="text-slate-400" />
            )}

            <span className="font-semibold text-slate-700">
              {option.text || "Вариант без текста"}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}