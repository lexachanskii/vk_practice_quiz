"use client";
import { useState } from "react";
import {
  Play, Plus, Edit3, BarChart2, LogOut, Clock, Users,
  Check, X, Trophy, ArrowRight, BookOpen, Zap, Award,
  Home, Upload, ChevronLeft, ChevronRight, Pause,
  SkipForward, Download, AlertCircle, RefreshCw,
  CheckSquare, Square, Medal, TrendingUp, Target,
  ListChecks, Eye, RotateCcw,
} from "lucide-react";

type Screen =
  | "landing"
  | "login"
  | "register"
  | "organizer-dashboard"
  | "create-quiz"
  | "add-question"
  | "launch-room"
  | "organizer-active"
  | "join-quiz"
  | "connection-error"
  | "active-question"
  | "question-with-image"
  | "multiple-choice"
  | "waiting-next"
  | "leaderboard"
  | "participant-final"
  | "participant-dashboard"
  | "organizer-results"
  | "session-history";

const mockQuizzes = [
  { id: 1, title: "История Древнего Рима", questions: 12, status: "Готов", date: "2 июля 2026", category: "История" },
  { id: 2, title: "Основы Python", questions: 20, status: "Черновик", date: "28 июня 2026", category: "Программирование" },
  { id: 3, title: "Географические открытия", questions: 15, status: "Завершён", date: "15 июня 2026", category: "География" },
];

const mockParticipants = ["Алексей К.", "Мария С.", "Дмитрий П.", "Анна В.", "Иван Л.", "Ольга Н."];

const mockLeaderboard = [
  { rank: 1, name: "Мария С.", score: 1850, correct: 10 },
  { rank: 2, name: "Алексей К.", score: 1720, correct: 9 },
  { rank: 3, name: "Анна В.", score: 1600, correct: 8 },
  { rank: 4, name: "Дмитрий П.", score: 1450, correct: 7 },
  { rank: 5, name: "Иван Л.", score: 1200, correct: 6 },
  { rank: 6, name: "Ольга Н.", score: 980, correct: 5 },
];

const mockDetailedResults = [
  { rank: 1, name: "Мария С.", score: 1850, correct: 10, total: 12, time: "4м 12с" },
  { rank: 2, name: "Алексей К.", score: 1720, correct: 9, total: 12, time: "4м 38с" },
  { rank: 3, name: "Анна В.", score: 1600, correct: 8, total: 12, time: "5м 02с" },
  { rank: 4, name: "Дмитрий П.", score: 1450, correct: 7, total: 12, time: "5м 20с" },
  { rank: 5, name: "Иван Л.", score: 1200, correct: 6, total: 12, time: "5м 55с" },
  { rank: 6, name: "Ольга Н.", score: 980, correct: 5, total: 12, time: "6м 10с" },
];

const mockSessions = [
  { id: 1, title: "История Древнего Рима", date: "2 июля 2026", code: "ABCD12", participants: 6, winner: "Мария С." },
  { id: 2, title: "Основы Python", date: "28 июня 2026", code: "XYZ789", participants: 14, winner: "Алексей К." },
  { id: 3, title: "Географические открытия", date: "15 июня 2026", code: "QW3RTY", participants: 9, winner: "Ольга Н." },
  { id: 4, title: "Основы Python", date: "10 июня 2026", code: "MN45PQ", participants: 11, winner: "Дмитрий П." },
];

const mockHistory = [
  { id: 1, title: "Основы Python", date: "5 июля 2026", place: 2, score: 1720, total: 6 },
  { id: 2, title: "История Древнего Рима", date: "28 июня 2026", place: 1, score: 1900, total: 8 },
  { id: 3, title: "Географические открытия", date: "20 июня 2026", place: 4, score: 1300, total: 12 },
];

const mockQuestion = {
  number: 3, total: 12, timeLeft: 18,
  text: "Какой из следующих алгоритмов имеет временную сложность O(n log n) в среднем случае?",
  options: [
    { id: "a", text: "Пузырьковая сортировка" },
    { id: "b", text: "Быстрая сортировка" },
    { id: "c", text: "Сортировка вставками" },
    { id: "d", text: "Линейный поиск" },
  ],
};

// ─── Shared primitives ────────────────────────────────────────────────────────

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "white" | "amber";
type BtnSize = "sm" | "md" | "lg" | "xl";

function Btn({
  children, variant = "primary", size = "md", onClick, className = "", disabled,
}: {
  children: React.ReactNode; variant?: BtnVariant; size?: BtnSize;
  onClick?: () => void; className?: string; disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer select-none";
  const variants: Record<BtnVariant, string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-400 shadow-sm hover:shadow-md active:scale-95",
    secondary: "bg-white text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 focus:ring-indigo-300 active:scale-95",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300 active:scale-95",
    danger: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400 active:scale-95",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-400 shadow-sm hover:shadow-md active:scale-95",
    white: "bg-white text-indigo-700 hover:bg-indigo-50 focus:ring-indigo-300 shadow-sm active:scale-95",
    amber: "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400 shadow-sm active:scale-95",
  };
  const sizes: Record<BtnSize, string> = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
    xl: "px-10 py-4 text-lg",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

function Field({
  label, type = "text", placeholder, value, onChange, readOnly,
}: {
  label?: string; type?: string; placeholder?: string;
  value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all text-sm"
      />
    </div>
  );
}

function NavBar({ onNavigate, role = "organizer" }: { onNavigate: (s: Screen) => void; role?: string }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between shadow-sm">
      <button onClick={() => onNavigate("landing")} className="flex items-center gap-2.5 cursor-pointer group">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
          <Zap size={15} className="text-white" />
        </div>
        <span className="text-base font-bold text-slate-900 tracking-tight">QuizFlow</span>
      </button>
      <div className="flex items-center gap-2">
        <Btn
          variant="ghost"
          size="sm"
          onClick={() => onNavigate(role === "organizer" ? "organizer-dashboard" : "participant-dashboard")}
        >
          <Home size={15} /> Кабинет
        </Btn>
        <Btn variant="secondary" size="sm" onClick={() => onNavigate("landing")}>
          <LogOut size={15} /> Выйти
        </Btn>
      </div>
    </nav>
  );
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 text-sm font-semibold mb-7 transition-colors cursor-pointer"
    >
      <ChevronLeft size={16} /> {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Готов": "bg-emerald-100 text-emerald-700",
    "Черновик": "bg-amber-100 text-amber-700",
    "Завершён": "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

// ─── Screen 1: Landing ────────────────────────────────────────────────────────

function LandingScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <header className="px-10 py-6 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
            <Zap size={17} className="text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">QuizFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Btn variant="ghost" size="sm" onClick={() => onNavigate("login")}>Войти</Btn>
          <Btn variant="primary" size="sm" onClick={() => onNavigate("register")}>Зарегистрироваться</Btn>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-10 pt-14 pb-24">
        <div className="grid grid-cols-[1fr_auto] gap-20 items-center mb-24">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Квизы в реальном времени
            </div>
            <h1 className="text-5xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Учитесь вместе,<br />
              <span className="text-indigo-600">соревнуйтесь</span> с интересом
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-xl">
              Создавайте квизы, запускайте их в реальном времени и соревнуйтесь с участниками.
              Простой инструмент для живых знаний.
            </p>
            <div className="flex flex-wrap gap-4">
              <Btn variant="primary" size="lg" onClick={() => onNavigate("register")}>
                <Plus size={19} /> Создать квиз
              </Btn>
              <Btn variant="secondary" size="lg" onClick={() => onNavigate("join-quiz")}>
                Присоединиться по коду
              </Btn>
            </div>
            <div className="flex items-center gap-6 mt-9 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Users size={14} className="text-indigo-400" /> 2 400+ участников</span>
              <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-violet-400" /> 340+ квизов создано</span>
              <span className="flex items-center gap-1.5"><Trophy size={14} className="text-amber-400" /> 12 000+ игр сыграно</span>
            </div>
          </div>

          <div className="relative w-[340px]">
            <div className="absolute -top-5 -right-5 w-24 h-24 rounded-3xl bg-violet-100 -z-10 rotate-12"></div>
            <div className="absolute -bottom-5 -left-5 w-16 h-16 rounded-2xl bg-indigo-100 -z-10 -rotate-6"></div>
            <div className="bg-white rounded-3xl shadow-2xl p-7 border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Текущий вопрос</div>
                  <div className="text-sm font-bold text-slate-700">4 из 12</div>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                  <Clock size={13} className="text-amber-500" />
                  <span className="text-amber-600 font-black text-sm">18с</span>
                </div>
              </div>
              <p className="text-slate-800 font-semibold text-sm mb-4 leading-snug">
                Какой элемент таблицы Менделеева обозначается символом «Au»?
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Серебро", c: "bg-violet-500" },
                  { label: "Золото", c: "bg-indigo-500" },
                  { label: "Платина", c: "bg-cyan-500" },
                  { label: "Медь", c: "bg-rose-500" },
                ].map((a, i) => (
                  <div key={i} className={`${a.c} ${i === 1 ? "ring-4 ring-indigo-200 scale-105 shadow-lg" : "opacity-80"} text-white px-3 py-2.5 rounded-xl text-xs font-bold`}>
                    {a.label}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                <div className="flex -space-x-1.5">
                  {["М", "А", "И", "Д"].map((l, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-indigo-700">{l}</div>
                  ))}
                </div>
                <span>6 участников онлайн</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: <BookOpen size={22} />, color: "indigo", title: "Создавайте квизы", desc: "Добавляйте вопросы с вариантами ответов, изображениями и гибкими настройками баллов." },
            { icon: <Zap size={22} />, color: "violet", title: "Запускайте в реальном времени", desc: "Участники подключаются по коду комнаты и отвечают синхронно вместе." },
            { icon: <Trophy size={22} />, color: "amber", title: "Следите за результатами", desc: "Лидерборд обновляется мгновенно, аналитика по каждому участнику сохраняется." },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${f.color === "indigo" ? "bg-indigo-100 text-indigo-600" : f.color === "violet" ? "bg-violet-100 text-violet-600" : "bg-amber-100 text-amber-600"}`}>
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ─── Screen 2: Auth ───────────────────────────────────────────────────────────

function AuthScreen({ mode, onNavigate }: { mode: "login" | "register"; onNavigate: (s: Screen) => void }) {
  const [tab, setTab] = useState<"login" | "register">(mode);
  const [role, setRole] = useState<"organizer" | "participant">("organizer");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-8">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <button onClick={() => onNavigate("landing")} className="inline-flex items-center gap-2.5 cursor-pointer group mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md group-hover:bg-indigo-700 transition-colors">
              <Zap size={19} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">QuizFlow</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-7">
            {(["login", "register"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${tab === t ? "bg-white text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                {t === "login" ? "Войти" : "Зарегистрироваться"}
              </button>
            ))}
          </div>

          {tab === "register" ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-black text-slate-900">Создайте аккаунт</h2>
              <Field label="Имя" placeholder="Иван Петров" />
              <Field label="Email" type="email" placeholder="ivan@example.com" />
              <Field label="Пароль" type="password" placeholder="Минимум 8 символов" />
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Роль</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "organizer", label: "Организатор", desc: "Создаю квизы", icon: <BookOpen size={18} /> },
                    { key: "participant", label: "Участник", desc: "Прохожу квизы", icon: <Trophy size={18} /> },
                  ].map((r) => (
                    <button key={r.key} onClick={() => setRole(r.key as "organizer" | "participant")} className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${role === r.key ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <div className={`mb-2 ${role === r.key ? "text-indigo-600" : "text-slate-400"}`}>{r.icon}</div>
                      <div className={`text-sm font-bold ${role === r.key ? "text-indigo-700" : "text-slate-700"}`}>{r.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <Btn variant="primary" size="md" className="mt-2 w-full" onClick={() => onNavigate(role === "organizer" ? "organizer-dashboard" : "participant-dashboard")}>
                Создать аккаунт <ArrowRight size={17} />
              </Btn>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-black text-slate-900">Добро пожаловать</h2>
              <Field label="Email" type="email" placeholder="ivan@example.com" />
              <Field label="Пароль" type="password" placeholder="Ваш пароль" />
              <div className="flex flex-col gap-3 mt-2">
                <Btn variant="primary" size="md" className="w-full" onClick={() => onNavigate("organizer-dashboard")}>Войти как организатор</Btn>
                <Btn variant="secondary" size="md" className="w-full" onClick={() => onNavigate("participant-dashboard")}>Войти как участник</Btn>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-slate-400 mt-5">
          {tab === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
          <button className="text-indigo-600 font-semibold hover:underline cursor-pointer" onClick={() => setTab(tab === "login" ? "register" : "login")}>
            {tab === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Screen 3: Organizer Dashboard ───────────────────────────────────────────

function OrganizerDashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar onNavigate={onNavigate} role="organizer" />
      <div className="max-w-5xl mx-auto px-8 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Мои квизы</h1>
            <p className="text-slate-500 mt-1 text-sm">Управляйте, редактируйте и запускайте квизы</p>
          </div>
          <div className="flex gap-3">
            <Btn variant="secondary" size="md" onClick={() => onNavigate("session-history")}>
              <BarChart2 size={16} /> История сессий
            </Btn>
            <Btn variant="primary" size="md" onClick={() => onNavigate("create-quiz")}>
              <Plus size={17} /> Создать квиз
            </Btn>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Всего квизов", value: "3", sub: "+1 за этот месяц", color: "indigo" },
            { label: "Проведено сессий", value: "14", sub: "2 на этой неделе", color: "violet" },
            { label: "Участников всего", value: "89", sub: "Среднее: 6 на сессию", color: "emerald" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`text-3xl font-black mb-1 ${s.color === "indigo" ? "text-indigo-600" : s.color === "violet" ? "text-violet-600" : "text-emerald-500"}`}>{s.value}</div>
              <div className="text-sm font-semibold text-slate-700">{s.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {mockQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-all duration-200 hover:border-indigo-100">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={20} className="text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-slate-800 text-sm">{quiz.title}</h3>
                    <StatusBadge status={quiz.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>{quiz.questions} вопросов</span><span>·</span>
                    <span>{quiz.category}</span><span>·</span>
                    <span>{quiz.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Btn variant="ghost" size="sm" onClick={() => onNavigate("create-quiz")}><Edit3 size={14} /> Редактировать</Btn>
                <Btn variant="ghost" size="sm" onClick={() => onNavigate("organizer-results")}><BarChart2 size={14} /> Результаты</Btn>
                <Btn variant="primary" size="sm" onClick={() => onNavigate("launch-room")}><Play size={14} /> Запустить</Btn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen 4: Create Quiz ────────────────────────────────────────────────────

function CreateQuizScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [timeSelected, setTimeSelected] = useState(1);
  const [scoringSelected, setScoringSelected] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar onNavigate={onNavigate} role="organizer" />
      <div className="max-w-2xl mx-auto px-8 pt-28 pb-16">
        <BackLink label="Назад к квизам" onClick={() => onNavigate("organizer-dashboard")} />
        <h1 className="text-2xl font-black text-slate-900 mb-8">Создать квиз</h1>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col gap-5">
          <Field label="Название квиза" placeholder="Например: История Древнего Рима" />
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Описание</label>
            <textarea rows={3} placeholder="Краткое описание для участников..." className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all resize-none text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Категория</label>
            <select className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all cursor-pointer text-sm font-medium">
              {["История", "Наука", "Программирование", "География", "Литература", "Математика"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Время на вопрос</label>
            <div className="grid grid-cols-4 gap-3">
              {["10с", "20с", "30с", "60с"].map((t, i) => (
                <button key={i} onClick={() => setTimeSelected(i)} className={`py-3 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer ${timeSelected === i ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-indigo-200"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Правила начисления баллов</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "За скорость ответа", desc: "Быстрее = больше баллов (макс. 1000)" },
                { label: "За правильность", desc: "Фиксированные 1000 баллов за правильный" },
              ].map((r, i) => (
                <button key={i} onClick={() => setScoringSelected(i)} className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${scoringSelected === i ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className={`text-sm font-bold mb-1 ${scoringSelected === i ? "text-indigo-700" : "text-slate-700"}`}>{r.label}</div>
                  <div className="text-xs text-slate-400 leading-snug">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold text-slate-800 text-sm">Вопросы</div>
                <div className="text-xs text-slate-400 mt-0.5">Добавлено: 0 вопросов</div>
              </div>
              <Btn variant="primary" size="sm" onClick={() => onNavigate("add-question")}><Plus size={15} /> Добавить вопрос</Btn>
            </div>
            <div className="bg-slate-50 rounded-2xl p-10 text-center border-2 border-dashed border-slate-200">
              <BookOpen size={28} className="text-slate-300 mx-auto mb-2.5" />
              <p className="text-slate-400 text-sm">Вопросы пока не добавлены.<br />Нажмите кнопку выше, чтобы начать.</p>
            </div>
          </div>
          <div className="flex gap-3 mt-1">
            <Btn variant="secondary" size="md" className="flex-1">Сохранить черновик</Btn>
            <Btn variant="primary" size="md" className="flex-1" onClick={() => onNavigate("organizer-dashboard")}>Сохранить квиз</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 5: Add Question ───────────────────────────────────────────────────

function AddQuestionScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [questionType, setQuestionType] = useState<"single" | "multiple">("single");
  const [options, setOptions] = useState([
    { text: "Серебро", correct: false },
    { text: "Золото", correct: true },
    { text: "Платина", correct: false },
    { text: "", correct: false },
  ]);

  const toggleCorrect = (idx: number) => {
    if (questionType === "single") {
      setOptions(options.map((o, i) => ({ ...o, correct: i === idx })));
    } else {
      setOptions(options.map((o, i) => (i === idx ? { ...o, correct: !o.correct } : o)));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar onNavigate={onNavigate} role="organizer" />
      <div className="max-w-2xl mx-auto px-8 pt-28 pb-16">
        <BackLink label="Назад к квизу" onClick={() => onNavigate("create-quiz")} />
        <h1 className="text-2xl font-black text-slate-900 mb-8">Добавить вопрос</h1>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col gap-5">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Текст вопроса</label>
            <textarea rows={3} defaultValue="Какой элемент таблицы Менделеева обозначается символом «Au»?" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all resize-none text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Изображение (необязательно)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-7 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group">
              <Upload size={22} className="text-slate-300 group-hover:text-indigo-400 mx-auto mb-2 transition-colors" />
              <p className="text-sm text-slate-400">Перетащите изображение или <span className="text-indigo-500 font-semibold">выберите файл</span></p>
              <p className="text-xs text-slate-300 mt-1">PNG, JPG до 5 МБ</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">Тип вопроса</label>
            <div className="flex gap-3">
              {[{ key: "single", label: "Одиночный выбор" }, { key: "multiple", label: "Множественный выбор" }].map((t) => (
                <button key={t.key} onClick={() => setQuestionType(t.key as "single" | "multiple")} className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer ${questionType === t.key ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>{t.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">Варианты ответа</label>
              {questionType === "multiple" && <span className="text-xs text-slate-400">Отметьте все правильные</span>}
            </div>
            <div className="flex flex-col gap-2.5">
              {options.map((opt, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${opt.correct ? "border-emerald-400 bg-emerald-50" : "border-slate-200"}`}>
                  <button onClick={() => toggleCorrect(i)} className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${opt.correct ? "border-emerald-500 bg-emerald-500" : "border-slate-300 hover:border-emerald-400"}`}>
                    {opt.correct && <Check size={10} className="text-white" strokeWidth={3.5} />}
                  </button>
                  <input type="text" value={opt.text} onChange={(e) => setOptions(options.map((o, idx) => (idx === i ? { ...o, text: e.target.value } : o)))} placeholder={`Вариант ${i + 1}`} className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-sm font-medium" />
                  <button onClick={() => setOptions(options.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"><X size={15} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => setOptions([...options, { text: "", correct: false }])} className="mt-3 flex items-center gap-1.5 text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors cursor-pointer">
              <Plus size={15} /> Добавить вариант
            </button>
          </div>
          <div className="flex gap-3 border-t border-slate-100 pt-5 mt-1">
            <Btn variant="secondary" size="md" className="flex-1" onClick={() => onNavigate("create-quiz")}>Сохранить квиз</Btn>
            <Btn variant="primary" size="md" className="flex-1" onClick={() => onNavigate("add-question")}>Сохранить и добавить ещё</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 6: Launch Room (Organizer) ───────────────────────────────────────

function LaunchRoomScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [started, setStarted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700">
      <div className="max-w-5xl mx-auto px-8 pt-10 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><Zap size={17} className="text-white" /></div>
            <span className="text-white font-bold text-base tracking-tight">QuizFlow</span>
          </div>
          <button onClick={() => onNavigate("organizer-dashboard")} className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold transition-colors cursor-pointer">
            <X size={15} /> Завершить сессию
          </button>
        </div>

        <div className="grid grid-cols-[1fr_280px] gap-6">
          <div className="flex flex-col gap-5">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Код комнаты</div>
              <div className="text-7xl font-black text-white tracking-[0.2em] mb-4 select-all" style={{ fontFamily: "monospace" }}>ABCD12</div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className={`w-2.5 h-2.5 rounded-full ${started ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`}></div>
                <span className="text-white/80 text-sm font-semibold">{started ? "Квиз идёт · Вопрос 3 из 12" : "Ожидание участников"}</span>
              </div>
              {!started && <Btn variant="success" size="lg" className="w-full" onClick={() => setStarted(true)}><Play size={20} /> Начать квиз</Btn>}
              {started && <Btn variant="primary" size="md" className="w-full" onClick={() => onNavigate("organizer-active")}><Eye size={16} /> Перейти к управлению квизом</Btn>}
            </div>

            {started && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Текущий вопрос</div>
                  <div className="flex items-center gap-2 bg-amber-400 rounded-xl px-3.5 py-1.5">
                    <Clock size={13} className="text-amber-900" /><span className="text-amber-900 font-black text-sm">18</span>
                  </div>
                </div>
                <p className="text-white font-semibold text-sm leading-relaxed mb-4">Какой из следующих алгоритмов имеет временную сложность O(n log n) в среднем случае?</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Пузырьковая сортировка", "Быстрая сортировка", "Сортировка вставками", "Линейный поиск"].map((a, i) => (
                    <div key={i} className="bg-white/10 rounded-xl px-3.5 py-2.5 text-white/80 text-xs font-medium flex items-center gap-2">
                      <span className="font-black text-white/40">{String.fromCharCode(65 + i)}</span>{a}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border border-white/20 h-fit">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-bold text-sm">Участники</span>
              <div className="bg-white/20 rounded-full px-2.5 py-0.5 text-white text-xs font-black">{mockParticipants.length}</div>
            </div>
            <div className="flex flex-col gap-2">
              {mockParticipants.map((p, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-3.5 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-black flex-shrink-0">{p[0]}</div>
                  <span className="text-white/90 text-xs font-semibold">{p}</span>
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NEW Screen: Organizer Active Quiz Management ─────────────────────────────

function OrganizerActiveScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [status, setStatus] = useState<"active" | "timeout" | "waiting">("active");
  const [paused, setPaused] = useState(false);
  const answeredCount = 4;

  const statusConfig = {
    active: { label: "Вопрос активен", dot: "bg-emerald-400", bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30" },
    timeout: { label: "Время вышло", dot: "bg-rose-400", bg: "bg-rose-500/20", text: "text-rose-300", border: "border-rose-500/30" },
    waiting: { label: "Ожидание следующего вопроса", dot: "bg-amber-400", bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30" },
  };

  const sc = statusConfig[status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700">
      <div className="max-w-6xl mx-auto px-8 pt-8 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><Zap size={17} className="text-white" /></div>
            <div>
              <div className="text-white font-bold text-sm leading-none">История Древнего Рима</div>
              <div className="text-white/50 text-xs mt-0.5">Комната: ABCD12</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border ${sc.bg} ${sc.border}`}>
              <div className={`w-2 h-2 rounded-full ${sc.dot} ${status === "active" && !paused ? "animate-pulse" : ""}`}></div>
              <span className={`text-xs font-bold ${sc.text}`}>{paused ? "Пауза" : sc.label}</span>
            </div>
            <button onClick={() => onNavigate("organizer-dashboard")} className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-semibold transition-colors cursor-pointer">
              <X size={14} /> Завершить
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_260px] gap-5">
          {/* Main */}
          <div className="flex flex-col gap-5">
            {/* Question card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-7 border border-white/20">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Вопрос 3 из 12</div>
                  <p className="text-white font-bold text-lg leading-snug max-w-xl">
                    Какой из следующих алгоритмов имеет временную сложность O(n log n) в среднем случае?
                  </p>
                </div>
                <div className={`flex items-center gap-2 rounded-2xl px-4 py-2 flex-shrink-0 ml-4 ${status === "timeout" ? "bg-rose-500" : "bg-amber-400"}`}>
                  <Clock size={15} className={status === "timeout" ? "text-white" : "text-amber-900"} />
                  <span className={`font-black text-xl ${status === "timeout" ? "text-white" : "text-amber-900"}`}>
                    {status === "timeout" ? "0" : "18"}
                  </span>
                </div>
              </div>

              {/* Options with answer distribution */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {["Пузырьковая", "Быстрая", "Вставками", "Линейный"].map((a, i) => {
                  const pct = [12, 58, 18, 12][i];
                  const isCorrect = i === 1;
                  return (
                    <div key={i} className={`rounded-xl p-3 border ${isCorrect ? "border-emerald-400/40 bg-emerald-500/15" : "border-white/10 bg-white/8"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white/40 text-xs font-black">{String.fromCharCode(65 + i)}</span>
                          <span className={`text-xs font-semibold ${isCorrect ? "text-emerald-300" : "text-white/70"}`}>{a}</span>
                          {isCorrect && <Check size={12} className="text-emerald-400" strokeWidth={3} />}
                        </div>
                        <span className={`text-xs font-bold ${isCorrect ? "text-emerald-300" : "text-white/50"}`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isCorrect ? "bg-emerald-400" : "bg-white/30"}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Answered progress */}
              <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <Users size={15} className="text-white/60" />
                <span className="text-white/70 text-sm font-semibold">Ответили: <span className="text-white font-black">{answeredCount}</span> из {mockParticipants.length}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden ml-2">
                  <div className="h-full bg-white/50 rounded-full transition-all" style={{ width: `${(answeredCount / mockParticipants.length) * 100}%` }}></div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-4 gap-3">
              <Btn
                variant={paused ? "success" : "amber"}
                size="md"
                className="col-span-1"
                onClick={() => setPaused(!paused)}
              >
                {paused ? <Play size={16} /> : <Pause size={16} />}
                {paused ? "Продолжить" : "Пауза"}
              </Btn>
              <Btn variant="white" size="md" className="col-span-1" onClick={() => setStatus("waiting")}>
                <Eye size={16} /> Лидерборд
              </Btn>
              <Btn variant="primary" size="md" className="col-span-1" onClick={() => setStatus("active")}>
                <SkipForward size={16} /> Следующий вопрос
              </Btn>
              <Btn variant="danger" size="md" className="col-span-1" onClick={() => onNavigate("organizer-results")}>
                <X size={16} /> Завершить квиз
              </Btn>
            </div>

            {/* Status hint */}
            {status === "timeout" && (
              <div className="bg-rose-500/20 border border-rose-400/30 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                <AlertCircle size={18} className="text-rose-300 flex-shrink-0" />
                <p className="text-rose-200 text-sm font-semibold">Время вышло. Нажмите «Следующий вопрос», чтобы продолжить.</p>
              </div>
            )}
            {status === "waiting" && (
              <div className="bg-amber-500/20 border border-amber-400/30 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                <Clock size={18} className="text-amber-300 flex-shrink-0" />
                <p className="text-amber-200 text-sm font-semibold">Участники видят результат вопроса. Запустите следующий вопрос.</p>
              </div>
            )}
          </div>

          {/* Right: participants + mini leaderboard */}
          <div className="flex flex-col gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold text-sm">Участники</span>
                <div className="bg-white/20 rounded-full px-2 py-0.5 text-white text-xs font-black">{mockParticipants.length}</div>
              </div>
              <div className="flex flex-col gap-1.5">
                {mockParticipants.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/8 rounded-lg px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">{p[0]}</div>
                    <span className="text-white/80 text-xs font-semibold flex-1 truncate">{p}</span>
                    {i < answeredCount
                      ? <Check size={12} className="text-emerald-400 flex-shrink-0" strokeWidth={3} />
                      : <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></div>
                    }
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <div className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Trophy size={14} className="text-amber-400" /> Текущий лидерборд
              </div>
              <div className="flex flex-col gap-1.5">
                {mockLeaderboard.slice(0, 4).map((p, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="text-white/40 text-xs font-black w-4 flex-shrink-0">{i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${p.rank}`}</span>
                    <span className="text-white/80 text-xs font-semibold flex-1 truncate">{p.name}</span>
                    <span className="text-white font-black text-xs">{p.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 7: Join Quiz (Participant) ────────────────────────────────────────

function JoinQuizScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");

  const handleJoin = () => {
    if (code === "ERR" || code.length < 4) {
      onNavigate("connection-error");
    } else {
      setJoined(true);
    }
  };

  if (joined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 flex items-center justify-center p-8">
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center mx-auto mb-6">
            <Users size={34} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Вы подключились!</h1>
          <p className="text-white/70 mb-1">Комната: <span className="text-white font-black tracking-widest" style={{ fontFamily: "monospace" }}>{code || "ABCD12"}</span></p>
          <p className="text-white/70 mb-8">Ник: <span className="text-white font-bold">{nickname || "Участник"}</span></p>
          <div className="bg-white/10 rounded-3xl p-7 border border-white/20 mb-6">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
              <span className="text-white/80 font-semibold text-sm">Ожидаем начала квиза...</span>
            </div>
            <p className="text-white/40 text-xs text-center mb-4">Организатор скоро запустит квиз</p>
            <div className="flex justify-center gap-2">
              {mockParticipants.slice(0, 4).map((p, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/10 flex items-center justify-center text-white text-xs font-bold">{p[0]}</div>
              ))}
              <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/10 flex items-center justify-center text-white text-xs font-bold">+2</div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Btn variant="white" size="md" onClick={() => onNavigate("active-question")}>Demo: одиночный выбор →</Btn>
            <Btn variant="secondary" size="md" onClick={() => onNavigate("question-with-image")}>Demo: вопрос с картинкой →</Btn>
            <Btn variant="secondary" size="md" onClick={() => onNavigate("multiple-choice")}>Demo: множественный выбор →</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-8">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <button onClick={() => onNavigate("landing")} className="inline-flex flex-col items-center gap-3 cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors">
              <Zap size={26} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">QuizFlow</span>
          </button>
          <p className="text-slate-500 mt-3 text-sm">Введите код комнаты от организатора</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col gap-5">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Код комнаты</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))} placeholder="ABCD12" maxLength={6} className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all text-3xl font-black text-center tracking-[0.3em] uppercase" />
          </div>
          <Field label="Ваш никнейм" placeholder="Алексей К." value={nickname} onChange={(e) => setNickname(e.target.value)} />
          <Btn variant="primary" size="lg" className="mt-1 w-full" onClick={handleJoin}>
            Присоединиться <ArrowRight size={19} />
          </Btn>
          <p className="text-xs text-slate-400 text-center">Введите «ERR» для демо ошибки подключения</p>
          <div className="text-center">
            <button onClick={() => onNavigate("landing")} className="text-sm text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">Вернуться на главную</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NEW Screen: Connection Error ─────────────────────────────────────────────

function ConnectionErrorScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-8">
      <div className="w-full max-w-[420px] text-center">
        <div className="w-20 h-20 rounded-3xl bg-rose-100 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={36} className="text-rose-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-3">Комната не найдена</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Комната не найдена или квиз уже завершён.<br />
          Проверьте код и попробуйте снова.
        </p>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 mb-8 text-left">
          <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Возможные причины</p>
          <ul className="text-sm text-rose-500 space-y-1">
            <li>· Код введён неверно</li>
            <li>· Квиз уже завершился</li>
            <li>· Организатор ещё не открыл комнату</li>
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <Btn variant="primary" size="lg" className="w-full" onClick={() => onNavigate("join-quiz")}>
            <RefreshCw size={18} /> Попробовать снова
          </Btn>
          <Btn variant="secondary" size="lg" className="w-full" onClick={() => onNavigate("landing")}>
            <Home size={18} /> Вернуться на главную
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 8: Active Question (Participant) ──────────────────────────────────

function ActiveQuestionScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const optionConfig = [
    { bg: "bg-violet-500", ring: "ring-violet-300", hover: "hover:bg-violet-600" },
    { bg: "bg-indigo-500", ring: "ring-indigo-300", hover: "hover:bg-indigo-600" },
    { bg: "bg-cyan-500", ring: "ring-cyan-300", hover: "hover:bg-cyan-600" },
    { bg: "bg-rose-500", ring: "ring-rose-300", hover: "hover:bg-rose-600" },
  ];

  if (submitted) return <WaitingNextScreen onNavigate={onNavigate} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 flex flex-col">
      <div className="px-8 py-5 flex items-center justify-between">
        <div className="bg-white/15 rounded-xl px-4 py-2"><span className="text-white font-bold text-sm">Вопрос {mockQuestion.number} / {mockQuestion.total}</span></div>
        <div className="flex items-center gap-2 bg-amber-400 rounded-2xl px-5 py-2 shadow-lg">
          <Clock size={15} className="text-amber-900" /><span className="text-amber-900 font-black text-xl">{mockQuestion.timeLeft}</span>
        </div>
        <div className="bg-white/15 rounded-xl px-4 py-2"><span className="text-white font-bold text-sm">850 баллов</span></div>
      </div>
      <div className="h-1.5 bg-white/20 mx-8 rounded-full overflow-hidden mb-1">
        <div className="h-full bg-white rounded-full" style={{ width: `${(mockQuestion.timeLeft / 30) * 100}%` }}></div>
      </div>
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-8 py-7 gap-6">
        <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-8 border border-white/20 text-center">
          <p className="text-white text-xl font-bold leading-relaxed">{mockQuestion.text}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {mockQuestion.options.map((opt, i) => {
            const isSelected = selected === opt.id;
            const c = optionConfig[i];
            return (
              <button key={opt.id} onClick={() => setSelected(opt.id)} className={`${c.bg} ${c.hover} text-white font-bold text-base py-6 px-6 rounded-2xl transition-all duration-200 cursor-pointer flex items-center gap-4 shadow-lg text-left ${isSelected ? `ring-4 ${c.ring} scale-[1.03] shadow-2xl` : "opacity-90 hover:opacity-100"}`}>
                <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-sm font-black flex-shrink-0">{String.fromCharCode(65 + i)}</span>
                <span className="leading-snug">{opt.text}</span>
                {isSelected && <Check size={20} className="ml-auto flex-shrink-0" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
        {selected && (
          <div className="flex justify-center">
            <Btn variant="success" size="lg" className="px-14" onClick={() => setSubmitted(true)}>
              <Check size={19} /> Ответить
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NEW Screen: Question with Image ─────────────────────────────────────────

function QuestionWithImageScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const optionConfig = [
    { bg: "bg-violet-500", ring: "ring-violet-300" },
    { bg: "bg-indigo-500", ring: "ring-indigo-300" },
    { bg: "bg-cyan-500", ring: "ring-cyan-300" },
    { bg: "bg-rose-500", ring: "ring-rose-300" },
  ];

  const options = [
    { id: "a", text: "Эйфелева башня" },
    { id: "b", text: "Биг-Бен" },
    { id: "c", text: "Колизей" },
    { id: "d", text: "Нотр-Дам де Пари" },
  ];

  if (submitted) return <WaitingNextScreen onNavigate={onNavigate} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 flex flex-col">
      {/* Top bar */}
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="bg-white/15 rounded-xl px-4 py-2"><span className="text-white font-bold text-sm">Вопрос 5 / 12</span></div>
        <div className="flex items-center gap-2 bg-amber-400 rounded-2xl px-5 py-2 shadow-lg">
          <Clock size={15} className="text-amber-900" /><span className="text-amber-900 font-black text-xl">22</span>
        </div>
        <div className="bg-white/15 rounded-xl px-4 py-2"><span className="text-white font-bold text-sm">1200 баллов</span></div>
      </div>
      <div className="h-1.5 bg-white/20 mx-8 rounded-full overflow-hidden mb-1">
        <div className="h-full bg-white rounded-full" style={{ width: "73%" }}></div>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-8 py-5 gap-4">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-indigo-900/30" style={{ height: "200px" }}>
          <img
            src="https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800&h=200&fit=crop&auto=format"
            alt="Известная архитектура мира"
            className="w-full h-full object-cover opacity-90"
          />
        </div>

        {/* Question text */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-5 border border-white/20 text-center">
          <p className="text-white text-lg font-bold leading-snug">
            Какая достопримечательность изображена на фото?
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {options.map((opt, i) => {
            const isSelected = selected === opt.id;
            const c = optionConfig[i];
            return (
              <button key={opt.id} onClick={() => setSelected(opt.id)} className={`${c.bg} hover:opacity-95 text-white font-bold text-sm py-5 px-5 rounded-2xl transition-all duration-200 cursor-pointer flex items-center gap-3 shadow-lg text-left ${isSelected ? `ring-4 ${c.ring} scale-[1.02] shadow-2xl` : "opacity-85"}`}>
                <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-black flex-shrink-0">{String.fromCharCode(65 + i)}</span>
                <span>{opt.text}</span>
                {isSelected && <Check size={18} className="ml-auto flex-shrink-0" strokeWidth={3} />}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="flex justify-center">
            <Btn variant="success" size="lg" className="px-14" onClick={() => setSubmitted(true)}>
              <Check size={19} /> Ответить
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NEW Screen: Multiple Choice ──────────────────────────────────────────────

function MultipleChoiceScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const options = [
    { id: "a", text: "Python" },
    { id: "b", text: "Java" },
    { id: "c", text: "HTML" },
    { id: "d", text: "JavaScript" },
    { id: "e", text: "CSS" },
    { id: "f", text: "Rust" },
  ];

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  if (submitted) return <WaitingNextScreen onNavigate={onNavigate} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 flex flex-col">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="bg-white/15 rounded-xl px-4 py-2"><span className="text-white font-bold text-sm">Вопрос 7 / 12</span></div>
        <div className="flex items-center gap-2 bg-amber-400 rounded-2xl px-5 py-2 shadow-lg">
          <Clock size={15} className="text-amber-900" /><span className="text-amber-900 font-black text-xl">25</span>
        </div>
        <div className="bg-white/15 rounded-xl px-4 py-2"><span className="text-white font-bold text-sm">950 баллов</span></div>
      </div>
      <div className="h-1.5 bg-white/20 mx-8 rounded-full overflow-hidden mb-1">
        <div className="h-full bg-white rounded-full" style={{ width: "83%" }}></div>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-8 py-5 gap-5">
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-5 border border-white/20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 mb-3">
            <ListChecks size={13} className="text-white/70" />
            <span className="text-white/70 text-xs font-semibold">Можно выбрать несколько ответов</span>
          </div>
          <p className="text-white text-lg font-bold leading-snug">
            Какие из перечисленных языков являются языками программирования?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {options.map((opt, i) => {
            const isSelected = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggle(opt.id)}
                className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-white/60 bg-white/20 shadow-lg scale-[1.02]"
                    : "border-white/15 bg-white/8 hover:bg-white/15 hover:border-white/30"
                }`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "border-white bg-white" : "border-white/40"}`}>
                  {isSelected && <Check size={13} className="text-indigo-600" strokeWidth={3} />}
                </div>
                <span className={`font-bold text-sm ${isSelected ? "text-white" : "text-white/75"}`}>{opt.text}</span>
                <span className={`ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${isSelected ? "bg-white/25 text-white" : "bg-white/10 text-white/40"}`}>
                  {String.fromCharCode(65 + i)}
                </span>
              </button>
            );
          })}
        </div>

        {selected.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm font-semibold">Выбрано: {selected.length}</span>
            <Btn variant="success" size="lg" className="px-12" onClick={() => setSubmitted(true)}>
              <Check size={19} /> Ответить ({selected.length})
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NEW Screen: Waiting for Next Question ────────────────────────────────────

function WaitingNextScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-sm w-full">
        <div className="w-24 h-24 rounded-full bg-emerald-400/20 border-4 border-emerald-400 flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-emerald-300" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Ответ принят!</h2>
        <p className="text-white/70 mb-8 text-sm">Ожидайте следующий вопрос</p>

        {/* Score card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-6 mb-8">
          <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Ваш результат</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-3xl font-black text-white mb-1">+850</div>
              <div className="text-white/50 text-xs font-semibold">Баллов за вопрос</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-2xl font-black text-white">#2</span>
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <div className="text-white/50 text-xs font-semibold">Текущее место</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-white/60 text-xs font-semibold">Всего баллов</span>
            <span className="text-white font-black text-lg">4 720</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 150}ms` }}></div>
          ))}
        </div>
        <p className="text-white/40 text-xs">Организатор готовит следующий вопрос</p>
        <div className="mt-5">
          <Btn variant="white" size="sm" onClick={() => onNavigate("leaderboard")}>Demo: лидерборд →</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Leaderboard ──────────────────────────────────────────────────────

function LeaderboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const medals = ["🥇", "🥈", "🥉"];
  const podiumBg = ["from-amber-400 to-yellow-500", "from-slate-300 to-slate-400", "from-orange-400 to-amber-500"];
  const podiumOrder = [mockLeaderboard[1], mockLeaderboard[0], mockLeaderboard[2]];
  const podiumRanks = [1, 0, 2];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700">
      <div className="max-w-xl mx-auto px-8 pt-10 pb-14">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-3xl font-black text-white tracking-tight">Итоги квиза</h1>
          <p className="text-white/60 mt-1.5 text-sm">История Древнего Рима · 12 вопросов</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-8 items-end">
          {podiumOrder.map((p, i) => {
            const rankIdx = podiumRanks[i];
            const isFirst = rankIdx === 0;
            return (
              <div key={i} className={`bg-gradient-to-b ${podiumBg[rankIdx]} rounded-2xl p-5 text-center shadow-lg ${isFirst ? "py-7 -mt-2 shadow-2xl" : "mt-4"}`}>
                <div className="text-3xl mb-2">{medals[rankIdx]}</div>
                <div className="text-white font-bold text-sm">{p.name}</div>
                <div className="text-white/80 text-xs mt-1 font-semibold">{p.score} б.</div>
              </div>
            );
          })}
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 overflow-hidden">
          <div className="px-6 py-3.5 border-b border-white/10 grid grid-cols-[auto_1fr_auto] gap-4 text-white/50 text-[11px] font-bold uppercase tracking-widest">
            <span className="w-10">Место</span><span>Участник</span><span>Баллы</span>
          </div>
          {mockLeaderboard.map((p, i) => (
            <div key={i} className={`px-6 py-3.5 grid grid-cols-[auto_1fr_auto] gap-4 items-center border-b border-white/5 last:border-0 ${i < 3 ? "bg-white/10" : ""}`}>
              <div className="w-10 text-base font-black text-white">{i < 3 ? medals[i] : `#${p.rank}`}</div>
              <div>
                <div className="text-white font-bold text-sm">{p.name}</div>
                <div className="text-white/40 text-xs">{p.correct} правильных</div>
              </div>
              <div className="text-white font-black">{p.score}</div>
            </div>
          ))}
        </div>
        <div className="mt-7 flex gap-3 justify-center">
          <Btn variant="white" size="md" onClick={() => onNavigate("participant-final")}>Мой результат</Btn>
          <Btn variant="secondary" size="md" onClick={() => onNavigate("participant-dashboard")}>В кабинет</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── NEW Screen: Participant Final Result ─────────────────────────────────────

function ParticipantFinalScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const result = { place: 2, score: 1720, correct: 9, total: 12, pct: 75, quizName: "История Древнего Рима" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <div className="text-5xl mb-4">🥈</div>
        <h1 className="text-3xl font-black text-white mb-1">Отличный результат!</h1>
        <p className="text-white/60 text-sm mb-8">{result.quizName}</p>

        <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-7 mb-6 text-left">
          <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-5 text-center">Ваш персональный результат</div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-white/10 rounded-2xl p-5 text-center">
              <div className="text-4xl font-black text-white mb-1">#{result.place}</div>
              <div className="text-white/50 text-xs font-semibold">Итоговое место</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-5 text-center">
              <div className="text-4xl font-black text-amber-300 mb-1">{result.score}</div>
              <div className="text-white/50 text-xs font-semibold">Баллов набрано</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-300 mb-1">{result.correct}/{result.total}</div>
              <div className="text-white/50 text-xs font-semibold">Правильных ответов</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-indigo-300 mb-1">{result.pct}%</div>
              <div className="text-white/50 text-xs font-semibold">Успешность</div>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-xs font-semibold">Процент успешности</span>
              <span className="text-white font-black text-sm">{result.pct}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full" style={{ width: `${result.pct}%` }}></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Btn variant="white" size="lg" className="w-full" onClick={() => onNavigate("participant-dashboard")}>
            <Home size={18} /> Вернуться в личный кабинет
          </Btn>
          <Btn variant="secondary" size="md" className="w-full" onClick={() => onNavigate("leaderboard")}>
            ← Назад к лидерборду
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Participant Dashboard ────────────────────────────────────────────

function ParticipantDashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const placeDisplay = (place: number) => {
    if (place === 1) return "🥇";
    if (place === 2) return "🥈";
    if (place === 3) return "🥉";
    return `#${place}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar onNavigate={onNavigate} role="participant" />
      <div className="max-w-3xl mx-auto px-8 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Мой профиль</h1>
            <p className="text-slate-500 mt-1 text-sm">История участия в квизах</p>
          </div>
          <Btn variant="primary" size="md" onClick={() => onNavigate("join-quiz")}>
            <Plus size={17} /> Присоединиться к квизу
          </Btn>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Пройдено квизов", value: "3", color: "indigo" },
            { label: "Мест в топ-3", value: "2", color: "amber" },
            { label: "Всего баллов", value: "4920", color: "violet" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`text-3xl font-black mb-1 ${s.color === "indigo" ? "text-indigo-600" : s.color === "amber" ? "text-amber-500" : "text-violet-600"}`}>{s.value}</div>
              <div className="text-sm font-semibold text-slate-700">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {mockHistory.map((h, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-all duration-200 hover:border-indigo-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${h.place === 1 ? "bg-amber-100" : h.place <= 3 ? "bg-slate-100" : "bg-indigo-50"}`}>
                  {placeDisplay(h.place)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{h.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>{h.date}</span><span>·</span>
                    <span>{h.total} участников</span><span>·</span>
                    <span className={`font-semibold ${h.place <= 3 ? "text-emerald-600" : "text-slate-500"}`}>{h.place <= 3 ? `Топ-${h.place}` : `Место ${h.place}`}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-indigo-600">{h.score}</div>
                <div className="text-xs text-slate-400">баллов</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── NEW Screen: Organizer Detailed Results ───────────────────────────────────

function OrganizerResultsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const medals = ["🥇", "🥈", "🥉"];
  const avgScore = Math.round(mockDetailedResults.reduce((s, p) => s + p.score, 0) / mockDetailedResults.length);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar onNavigate={onNavigate} role="organizer" />
      <div className="max-w-4xl mx-auto px-8 pt-28 pb-16">
        <BackLink label="Назад к квизам" onClick={() => onNavigate("organizer-dashboard")} />

        {/* Summary header */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-1">История Древнего Рима</h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>2 июля 2026</span><span>·</span>
                <span>Код: <span className="font-bold text-slate-600 tracking-widest">ABCD12</span></span><span>·</span>
                <span>12 вопросов</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Btn variant="secondary" size="sm">
                <Download size={15} /> Скачать результаты
              </Btn>
              <Btn variant="primary" size="sm" onClick={() => onNavigate("organizer-dashboard")}>
                <Home size={15} /> В кабинет
              </Btn>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            {[
              { label: "Участников", value: mockDetailedResults.length.toString(), color: "indigo", icon: <Users size={17} /> },
              { label: "Средний балл", value: avgScore.toString(), color: "violet", icon: <TrendingUp size={17} /> },
              { label: "Победитель", value: mockDetailedResults[0].name, color: "amber", icon: <Trophy size={17} /> },
              { label: "Лучший результат", value: mockDetailedResults[0].score.toString(), color: "emerald", icon: <Award size={17} /> },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl p-4 ${i === 0 ? "bg-indigo-50" : i === 1 ? "bg-violet-50" : i === 2 ? "bg-amber-50" : "bg-emerald-50"}`}>
                <div className={`mb-2 ${i === 0 ? "text-indigo-500" : i === 1 ? "text-violet-500" : i === 2 ? "text-amber-500" : "text-emerald-500"}`}>{s.icon}</div>
                <div className={`text-xl font-black mb-0.5 ${i === 0 ? "text-indigo-700" : i === 1 ? "text-violet-700" : i === 2 ? "text-amber-700" : "text-emerald-700"}`}>{s.value}</div>
                <div className="text-xs text-slate-500 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 grid grid-cols-[40px_1fr_100px_120px_100px_90px] gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Место</span><span>Участник</span><span>Баллы</span><span>Правильных</span><span>Успешность</span><span>Время</span>
          </div>
          {mockDetailedResults.map((p, i) => {
            const pct = Math.round((p.correct / p.total) * 100);
            return (
              <div key={i} className={`px-6 py-4 grid grid-cols-[40px_1fr_100px_120px_100px_90px] gap-4 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${i < 3 ? "bg-slate-50/50" : ""}`}>
                <div className="text-base font-black text-slate-700">{i < 3 ? medals[i] : `#${p.rank}`}</div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{p.name}</div>
                </div>
                <div className="font-black text-indigo-600">{p.score}</div>
                <div>
                  <div className="text-sm font-bold text-slate-700">{p.correct}/{p.total}</div>
                  <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
                <div className={`text-sm font-bold ${pct >= 75 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-500"}`}>{pct}%</div>
                <div className="text-sm text-slate-400 font-medium">{p.time}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── NEW Screen: Session History (Organizer) ──────────────────────────────────

function SessionHistoryScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar onNavigate={onNavigate} role="organizer" />
      <div className="max-w-4xl mx-auto px-8 pt-28 pb-16">
        <BackLink label="Назад к квизам" onClick={() => onNavigate("organizer-dashboard")} />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">История сессий</h1>
            <p className="text-slate-500 mt-1 text-sm">Все проведённые игровые сессии</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2 text-sm font-bold text-indigo-600">
            {mockSessions.length} сессий всего
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {mockSessions.map((s, i) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 hover:border-indigo-100 overflow-hidden">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                    <BarChart2 size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{s.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{s.date}</span><span>·</span>
                      <span>Код: <span className="font-bold text-slate-600 tracking-wider" style={{ fontFamily: "monospace" }}>{s.code}</span></span><span>·</span>
                      <span className="flex items-center gap-1"><Users size={11} /> {s.participants} участников</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-semibold mb-0.5">Победитель</div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-amber-600">
                      <span>🥇</span>{s.winner}
                    </div>
                  </div>
                  <Btn variant="primary" size="sm" onClick={() => onNavigate("organizer-results")}>
                    <Eye size={14} /> Открыть результаты
                  </Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Navigation panel ─────────────────────────────────────────────────────────

const allScreens: { key: Screen; label: string; group: string }[] = [
  { key: "landing", label: "1. Главная", group: "Общие" },
  { key: "login", label: "2. Вход", group: "Общие" },
  { key: "register", label: "3. Регистрация", group: "Общие" },
  { key: "organizer-dashboard", label: "4. Кабинет орг.", group: "Организатор" },
  { key: "create-quiz", label: "5. Создать квиз", group: "Организатор" },
  { key: "add-question", label: "6. Добавить вопрос", group: "Организатор" },
  { key: "launch-room", label: "7. Запуск комнаты", group: "Организатор" },
  { key: "organizer-active", label: "8. Управление квизом ★", group: "Организатор" },
  { key: "organizer-results", label: "9. Подробные результаты ★", group: "Организатор" },
  { key: "session-history", label: "10. История сессий ★", group: "Организатор" },
  { key: "join-quiz", label: "11. Подключиться", group: "Участник" },
  { key: "connection-error", label: "12. Ошибка подключения ★", group: "Участник" },
  { key: "active-question", label: "13. Одиночный выбор", group: "Участник" },
  { key: "question-with-image", label: "14. Вопрос с картинкой ★", group: "Участник" },
  { key: "multiple-choice", label: "15. Множественный выбор ★", group: "Участник" },
  { key: "waiting-next", label: "16. Ожидание вопроса ★", group: "Участник" },
  { key: "leaderboard", label: "17. Лидерборд", group: "Участник" },
  { key: "participant-final", label: "18. Финальный результат ★", group: "Участник" },
  { key: "participant-dashboard", label: "19. Кабинет уч.", group: "Участник" },
];

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [current, setCurrent] = useState<Screen>("landing");
  const [open, setOpen] = useState(false);

  const navigate = (s: Screen) => { setCurrent(s); setOpen(false); };

  const renderScreen = () => {
    switch (current) {
      case "landing": return <LandingScreen onNavigate={navigate} />;
      case "login": return <AuthScreen mode="login" onNavigate={navigate} />;
      case "register": return <AuthScreen mode="register" onNavigate={navigate} />;
      case "organizer-dashboard": return <OrganizerDashboard onNavigate={navigate} />;
      case "create-quiz": return <CreateQuizScreen onNavigate={navigate} />;
      case "add-question": return <AddQuestionScreen onNavigate={navigate} />;
      case "launch-room": return <LaunchRoomScreen onNavigate={navigate} />;
      case "organizer-active": return <OrganizerActiveScreen onNavigate={navigate} />;
      case "join-quiz": return <JoinQuizScreen onNavigate={navigate} />;
      case "connection-error": return <ConnectionErrorScreen onNavigate={navigate} />;
      case "active-question": return <ActiveQuestionScreen onNavigate={navigate} />;
      case "question-with-image": return <QuestionWithImageScreen onNavigate={navigate} />;
      case "multiple-choice": return <MultipleChoiceScreen onNavigate={navigate} />;
      case "waiting-next": return <WaitingNextScreen onNavigate={navigate} />;
      case "leaderboard": return <LeaderboardScreen onNavigate={navigate} />;
      case "participant-final": return <ParticipantFinalScreen onNavigate={navigate} />;
      case "participant-dashboard": return <ParticipantDashboard onNavigate={navigate} />;
      case "organizer-results": return <OrganizerResultsScreen onNavigate={navigate} />;
      case "session-history": return <SessionHistoryScreen onNavigate={navigate} />;
    }
  };

  const groups = ["Общие", "Организатор", "Участник"];

  return (
    <div className="relative" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[100] w-12 h-12 rounded-full bg-indigo-600 shadow-xl flex items-center justify-center text-white hover:bg-indigo-700 transition-colors cursor-pointer"
        title="Навигация по экранам"
      >
        {open ? <X size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-[100] bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 w-68 max-h-[75vh] overflow-y-auto" style={{ width: "280px" }}>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1 flex items-center gap-2">
            Экраны <span className="text-indigo-500">★ новые</span>
          </div>
          {groups.map((g) => (
            <div key={g} className="mb-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1.5">{g}</div>
              {allScreens.filter((s) => s.group === g).map((s) => (
                <button
                  key={s.key}
                  onClick={() => navigate(s.key)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${current === s.key ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {renderScreen()}
    </div>
  );
}
