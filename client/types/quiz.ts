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