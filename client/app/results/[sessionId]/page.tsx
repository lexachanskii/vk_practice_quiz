import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export default function ResultsPage() {
  return (
    <PagePlaceholder
      title="Результаты квиза"
      description="Здесь будет финальный лидерборд, победитель и статистика по сессии."
      nextStep="подключить GET /sessions/:id/results"
    />
  );
}