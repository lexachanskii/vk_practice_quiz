import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export default function JoinPage() {
  return (
    <PagePlaceholder
      title="Подключение к квизу"
      description="Здесь участник введёт код комнаты и nickname, после чего попадёт на игровую страницу."
      nextStep="подключить POST /sessions/join"
    />
  );
}