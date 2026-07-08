import type { InputHTMLAttributes } from "react";

type AppInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function AppInput({ label, className = "", ...props }: AppInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-slate-700">{label}</label>
      )}

      <input
        className={`w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${className}`}
        {...props}
      />
    </div>
  );
}