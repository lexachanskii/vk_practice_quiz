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