import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Logo } from "@/components/layout/Logo";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <h1 className="mb-2 text-center text-3xl font-black text-slate-900">
          Регистрация
        </h1>

        <p className="mb-8 text-center text-slate-500">
          Позже подключим POST /auth/register.
        </p>

        <div className="flex flex-col gap-4">
          <AppInput label="Имя" placeholder="Дарья" />
          <AppInput label="Email" type="email" placeholder="organizer@test.com" />
          <AppInput label="Пароль" type="password" placeholder="••••••••" />

          <AppButton type="button" className="mt-2">
            Зарегистрироваться
          </AppButton>

          <AppButton href="/login" variant="ghost">
            Уже есть аккаунт? Войти
          </AppButton>
        </div>
      </div>
    </main>
  );
}