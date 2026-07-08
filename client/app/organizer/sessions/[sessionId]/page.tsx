import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export default function OrganizerSessionPage() {
  return (
    <PagePlaceholder
      title="Управление игрой"
      description="Здесь будет real-time экран организатора: список участников, запуск сессии, показ вопросов, завершение вопросов и лидерборд."
      nextStep="подключить Socket.IO для организатора"
    />
  );
}