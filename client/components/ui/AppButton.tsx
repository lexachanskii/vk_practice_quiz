import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success";

type AppButtonSize = "sm" | "md" | "lg";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
};

export function AppButton({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: AppButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95";

  const variants: Record<AppButtonVariant, string> = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-400 shadow-sm hover:shadow-md",
    secondary:
      "bg-white text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 focus:ring-indigo-300",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300",
    danger:
      "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400",
    success:
      "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-400 shadow-sm hover:shadow-md",
  };

  const sizes: Record<AppButtonSize, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}