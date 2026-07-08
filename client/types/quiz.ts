export type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type QuizCategory = {
  id: string;
  name: string;
};

export type QuizCategoryRelation = {
  category?: QuizCategory;
  id?: string;
  name?: string;
};

export type QuizQuestion = {
  id: string;
  text: string | null;
  imageUrl: string | null;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  order: number;
};

export type QuizSession = {
  id: string;
  roomCode: string;
  status: "WAITING" | "ACTIVE" | "FINISHED" | "CANCELLED";
  createdAt: string;
};

export type Quiz = {
  id: string;
  title: string;
  description: string | null;
  status: QuizStatus;
  defaultTimeLimitSeconds: number;
  pointsPerQuestion: number;
  createdAt: string;
  updatedAt: string;
  categories?: QuizCategoryRelation[];
  questions?: QuizQuestion[];
  sessions?: QuizSession[];
};

export type MyQuizzesResponse = {
  quizzes: Quiz[];
};

export type CreateQuizPayload = {
  title: string;
  description?: string;
  defaultTimeLimitSeconds: number;
  pointsPerQuestion: number;
  categories: string[];
};

export type CreateQuizResponse = {
  message: string;
  quiz: Quiz;
};

export type AnswerOption = {
  id: string;
  text: string | null;
  imageUrl: string | null;
  order: number;
  isCorrect: boolean;
};

export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE";

export type FullQuestion = {
  id: string;
  quizId: string;
  text: string | null;
  imageUrl: string | null;
  type: QuestionType;
  order: number;
  timeLimitSeconds: number | null;
  points: number | null;
  options: AnswerOption[];
};

export type FullQuiz = Omit<Quiz, "questions"> & {
  questions: FullQuestion[];
};

export type GetQuizResponse = {
  quiz: FullQuiz;
};

export type CreateQuestionOptionPayload = {
  text?: string;
  imageUrl?: string;
  isCorrect: boolean;
};

export type CreateQuestionPayload = {
  text?: string;
  imageUrl?: string;
  type: QuestionType;
  timeLimitSeconds?: number;
  points?: number;
  options: CreateQuestionOptionPayload[];
};

export type CreateQuestionResponse = {
  message: string;
  question: FullQuestion;
};

export type StartQuizSessionResponse = {
  message: string;
  session: QuizSession;
};

export type SessionParticipant = {
  id: string;
  sessionId: string;
  userId: string | null;
  nickname: string;
  score: number;
  createdAt?: string;
  updatedAt?: string;
};

export type JoinSessionPayload = {
  roomCode: string;
  nickname: string;
};

export type JoinSessionResponse = {
  message: string;
  session: QuizSession;
  participant: SessionParticipant;
};

export type ParticipantHistoryItem = {
  id: string;
  nickname: string;
  score: number;
  place: number | null;
  correctAnswersCount: number;
  totalAnswersCount: number;
  session: {
    id: string;
    roomCode: string;
    status: "WAITING" | "ACTIVE" | "FINISHED" | "CANCELLED";
    createdAt: string;
    startedAt: string | null;
    finishedAt: string | null;
    quiz: {
      id: string;
      title: string;
    };
    questionsCount: number;
  };
};

export type ParticipantHistoryResponse = {
  participations: ParticipantHistoryItem[];
};