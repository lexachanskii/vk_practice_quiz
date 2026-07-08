"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Logo } from "@/components/layout/Logo";
import { registerUser } from "@/lib/auth";
import type { UserRole } from "@/types/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("Дарья");
  const [email, setEmail] = useState("organizer@test.com");
  const [password, setPassword] = useState("123456");
  const [role, setRole] = useState<UserRole>("ORGANIZER");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const data = await registerUser({
        name,
        email,
        password,
        role,
      });

      if (data.user.role === "ORGANIZER") {
        router.push("/organizer");
      } else {
        router.push("/join");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ошибка регистрации");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm"
      >
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <h1 className="mb-2 text-center text-3xl font-black text-slate-900">
          Регистрация
        </h1>

        <p className="mb-8 text-center text-slate-500">
          Создайте аккаунт для работы с квизами.
        </p>

        <div className="flex flex-col gap-4">
          <AppInput
            label="Имя"
            placeholder="Дарья"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <AppInput
            label="Email"
            type="email"
            placeholder="organizer@test.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <AppInput
            label="Пароль"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Роль
            </label>

            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="ORGANIZER">Организатор</option>
              <option value="PARTICIPANT">Участник</option>
            </select>
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-600">
              {error}
            </div>
          )}

          <AppButton type="submit" className="mt-2" disabled={isLoading}>
            {isLoading ? "Регистрируем..." : "Зарегистрироваться"}
          </AppButton>

          <AppButton href="/login" variant="ghost">
            Уже есть аккаунт? Войти
          </AppButton>
        </div>
      </form>
    </main>
  );
}