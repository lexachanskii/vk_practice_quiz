import { AppButton } from "@/components/ui/AppButton";
import { Logo } from "@/components/layout/Logo";

export function PublicHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-100 bg-white/95 px-8 py-4 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo />

        <nav className="flex items-center gap-2">
          <AppButton href="/join" variant="ghost" size="sm">
            Войти по коду
          </AppButton>

          <AppButton href="/login" variant="secondary" size="sm">
            Вход
          </AppButton>

          <AppButton href="/register" size="sm">
            Регистрация
          </AppButton>
        </nav>
      </div>
    </header>
  );
}