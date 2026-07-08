import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export default function NewQuizPage() {
  return (
    <PagePlaceholder
      title="Создание квиза"
      description="Здесь будет форма создания квиза: название, описание, категории, время вопроса и баллы."
      nextStep="подключить POST /quizzes"
    />
  );
}