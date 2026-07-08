import { AppButton } from "@/components/ui/AppButton";
import { Logo } from "@/components/layout/Logo";

type PagePlaceholderProps = {
  title: string;
  description: string;
  nextStep?: string;
};

export function PagePlaceholder({
  title,
  description,
  nextStep,
}: PagePlaceholderProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <Logo />

          <AppButton href="/" variant="secondary" size="sm">
            На главную
          </AppButton>
        </div>

        <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-indigo-600">
            Frontend route
          </p>

          <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-900">
            {title}
          </h1>

          <p className="max-w-2xl text-slate-600">{description}</p>

          {nextStep && (
            <div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-sm font-semibold text-indigo-700">
              Следующий шаг: {nextStep}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}