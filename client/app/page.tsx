import {
  BarChart3,
  CheckCircle2,
  Clock,
  Play,
  Plus,
  Radio,
  Users,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { AppButton } from "@/components/ui/AppButton";

const features = [
  {
    title: "Создание квизов",
    description:
      "Организатор добавляет вопросы, варианты ответов, изображения, время и баллы.",
    icon: Plus,
  },
  {
    title: "Комната по коду",
    description:
      "Участники подключаются к запущенному квизу по короткому коду комнаты.",
    icon: Users,
  },
  {
    title: "Real-time игра",
    description:
      "Вопросы показываются всем участникам одновременно",
    icon: Radio,
  },
  {
    title: "Результаты и история",
    description:
      "После завершения квиза доступны лидерборд, победитель и история сессий.",
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100">
      <PublicHeader />

      <section className="mx-auto flex min-h-screen max-w-6xl items-center px-8 pt-24">
        <div className="grid w-full gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-700">
              Real-time quiz platform
            </div>

            <h1 className="mb-6 max-w-3xl text-5xl font-black leading-tight tracking-tight text-slate-950">
              Создавайте квизы и проводите их в реальном времени
            </h1>

            <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-600">
              Организатор создаёт вопросы, запускает комнату, участники
              подключаются по коду, отвечают во время показа вопроса и сразу
              видят результаты.
            </p>

            <div className="flex flex-wrap gap-3">
              <AppButton href="/register" size="lg">
                <Plus size={18} />
                Создать квиз
              </AppButton>

              <AppButton href="/join" variant="secondary" size="lg">
                <Play size={18} />
                Войти по коду
              </AppButton>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white bg-white/80 p-6 shadow-xl backdrop-blur">
            <div className="mb-5 rounded-[1.5rem] bg-slate-950 p-6 text-white">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/40">
                    Сценарий работы
                  </p>
                  <p className="text-2xl font-black">Онлайн-квиз</p>
                </div>

                <div className="rounded-2xl bg-indigo-500/20 px-4 py-2 text-sm font-bold text-indigo-200">
                  Socket.IO
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                  <CheckCircle2 size={20} className="text-emerald-300" />
                  <span className="font-semibold">Создать квиз и вопросы</span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                  <Users size={20} className="text-indigo-300" />
                  <span className="font-semibold">
                    Запустить комнату и пригласить участников
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                  <Clock size={20} className="text-amber-300" />
                  <span className="font-semibold">
                    Показывать вопросы с ограничением времени
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                  <BarChart3 size={20} className="text-emerald-300" />
                  <span className="font-semibold">
                    Получить лидерборд и результаты
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div key={feature.title} className="rounded-2xl bg-white p-4">
                    <Icon className="mb-3 text-indigo-600" size={22} />
                    <h2 className="mb-2 font-black text-slate-900">
                      {feature.title}
                    </h2>
                    <p className="text-sm leading-6 text-slate-500">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}