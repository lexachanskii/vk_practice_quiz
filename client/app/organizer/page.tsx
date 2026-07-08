import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export default function OrganizerPage() {
  return (
    <PagePlaceholder
      title="Кабинет организатора"
      description="Здесь будет список квизов организатора, кнопка создания квиза, запуск комнаты и переход к результатам."
      nextStep="подключить GET /quizzes/my"
    />
  );
}