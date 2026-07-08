"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogIn, UserRound } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Logo } from "@/components/layout/Logo";
import { joinQuizSession } from "@/lib/sessions";
import { saveParticipantSession } from "@/lib/participant";

export default function JoinPage() {
  const router = useRouter();

  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("Player1");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsJoining(true);

    try {
      const data = await joinQuizSession({
        roomCode: roomCode.trim().toUpperCase(),
        nickname: nickname.trim(),
      });

      saveParticipantSession(data.participant, data.session);

      router.push(`/play/${data.session.id}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Не удалось подключиться"
      );
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-6 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Logo />

          <AppButton href="/" variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Главная
          </AppButton>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-8 shadow-sm"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50">
            <LogIn size={28} className="text-indigo-600" />
          </div>

          <h1 className="mb-3 text-center text-3xl font-black tracking-tight text-slate-900">
            Войти в квиз
          </h1>

          <p className="mb-8 text-center text-slate-500">
            Введите код комнаты от организатора и свой nickname.
          </p>

          <div className="flex flex-col gap-4">
            <AppInput
              label="Код комнаты"
              placeholder="Например: ABCD12"
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
              required
            />

            <AppInput
              label="Nickname"
              placeholder="Player1"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              required
            />

            {error && (
              <div className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-600">
                {error}
              </div>
            )}

            <AppButton
              type="submit"
              size="lg"
              className="mt-2"
              disabled={isJoining}
            >
              <UserRound size={18} />
              {isJoining ? "Подключаемся..." : "Подключиться"}
            </AppButton>
          </div>
        </form>
      </div>
    </main>
  );
}