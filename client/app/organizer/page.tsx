"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, LogOut, User } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { Logo } from "@/components/layout/Logo";
import { clearAuth, getCurrentUser, getSavedUser, getToken } from "@/lib/auth";
import type { AuthUser } from "@/types/auth";

export default function OrganizerPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(getSavedUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (currentUser.role !== "ORGANIZER") {
          router.replace("/join");
          return;
        }

        setUser(currentUser);
      } catch {
        clearAuth();
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.push("/");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="font-bold text-slate-700">Проверяем авторизацию...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-sm sm:flex">
              <User size={16} className="text-indigo-600" />
              <span className="text-sm font-bold text-slate-700">
                {user?.name || user?.email}
              </span>
            </div>

            <AppButton variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} />
              Выйти
            </AppButton>
          </div>
        </header>

        <section className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-indigo-600">
                Organizer dashboard
              </p>

              <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
                Кабинет организатора
              </h1>

              <p className="max-w-2xl text-slate-600">
                Авторизация уже подключена. Следующим блоком загрузим реальные
                квизы через GET /quizzes/my.
              </p>
            </div>

            <AppButton href="/organizer/quizzes/new" size="lg">
              <Plus size={18} />
              Создать квиз
            </AppButton>
          </div>
        </section>

        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="mb-2 text-2xl font-black text-slate-900">
            Здесь будет список квизов
          </h2>

          <p className="text-slate-500">
            Сейчас страница уже защищена токеном. Без входа сюда попасть нельзя.
          </p>
        </section>
      </div>
    </main>
  );
}