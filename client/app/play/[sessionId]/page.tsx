import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export default function PlayPage() {
  return (
    <PagePlaceholder
      title="Игровой экран участника"
      description="Здесь участник будет получать вопросы через Socket.IO, выбирать ответы и видеть состояние игры."
      nextStep="подключить participant_join_session и submit_answer"
    />
  );
}