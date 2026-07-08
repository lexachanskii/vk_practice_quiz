import Link from "next/link";
import { Zap } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
        <Zap size={17} className="text-white" />
      </div>

      <span className="text-lg font-black tracking-tight text-slate-900">
        QuizFlow
      </span>
    </Link>
  );
}