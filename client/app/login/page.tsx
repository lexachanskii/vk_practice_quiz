"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Logo } from "@/components/layout/Logo";
import { loginUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("organizer@test.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const data = await loginUser({
        email,
        password,
      });

      if (data.user.role === "ORGANIZER") {
        router.push("/organizer");
      } else {
        router.push("/join");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ошибка входа");
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
          Вход
        </h1>

        <p className="mb-8 text-center text-slate-500">
          Войдите в аккаунт организатора или участника.
        </p>

        <div className="flex flex-col gap-4">
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

          {error && (
            <div className="rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-600">
              {error}
            </div>
          )}

          <AppButton type="submit" className="mt-2" disabled={isLoading}>
            {isLoading ? "Входим..." : "Войти"}
          </AppButton>

          <AppButton href="/register" variant="ghost">
            Нет аккаунта? Зарегистрироваться
          </AppButton>
        </div>
      </form>
    </main>
  );
}