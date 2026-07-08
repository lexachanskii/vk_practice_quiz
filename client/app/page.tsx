import { Play, Plus, Trophy, Users } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { AppButton } from "@/components/ui/AppButton";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100">
      <PublicHeader />

      <section className="mx-auto flex min-h-screen max-w-6xl items-center px-8 pt-24">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
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
              видят лидерборд.
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

              <AppButton href="/figma-preview" variant="ghost" size="lg">
                Figma preview
              </AppButton>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white bg-white/80 p-6 shadow-xl backdrop-blur">
            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/40">
                    Комната
                  </p>
                  <p className="text-3xl font-black tracking-widest">ABCD12</p>
                </div>

                <div className="rounded-2xl bg-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-300">
                  LIVE
                </div>
              </div>

              <div className="mb-4 rounded-2xl bg-white/10 p-4">
                <p className="mb-2 text-xs font-black uppercase tracking-widest text-white/40">
                  Текущий вопрос
                </p>
                <h2 className="text-xl font-black">
                  Какой алгоритм имеет сложность O(n log n)?
                </h2>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl bg-white/10 p-4 font-semibold">
                  Пузырьковая сортировка
                </div>
                <div className="rounded-2xl bg-indigo-500 p-4 font-semibold">
                  Быстрая сортировка
                </div>
                <div className="rounded-2xl bg-white/10 p-4 font-semibold">
                  Сортировка вставками
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-indigo-50 p-4">
                <Users className="mb-2 text-indigo-600" size={22} />
                <p className="text-2xl font-black text-slate-900">24</p>
                <p className="text-sm font-semibold text-slate-500">
                  участника
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4">
                <Trophy className="mb-2 text-amber-500" size={22} />
                <p className="text-2xl font-black text-slate-900">1850</p>
                <p className="text-sm font-semibold text-slate-500">
                  лучший счёт
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}