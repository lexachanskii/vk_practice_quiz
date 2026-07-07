-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PARTICIPANT', 'ORGANIZER');

-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('WAITING', 'ACTIVE', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SessionQuestionStatus" AS ENUM ('PENDING', 'ACTIVE', 'FINISHED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PARTICIPANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "QuizStatus" NOT NULL DEFAULT 'DRAFT',
    "defaultTimeLimitSeconds" INTEGER NOT NULL DEFAULT 30,
    "pointsPerQuestion" INTEGER NOT NULL DEFAULT 100,
    "organizerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_categories" (
    "quizId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "quiz_categories_pkey" PRIMARY KEY ("quizId","categoryId")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "text" TEXT,
    "imageUrl" TEXT,
    "type" "QuestionType" NOT NULL,
    "order" INTEGER NOT NULL,
    "timeLimitSeconds" INTEGER,
    "points" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT,
    "imageUrl" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answer_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_sessions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'WAITING',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_participants" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "nickname" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_questions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "status" "SessionQuestionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "session_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participant_answers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participant_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participant_answer_options" (
    "participantAnswerId" TEXT NOT NULL,
    "answerOptionId" TEXT NOT NULL,

    CONSTRAINT "participant_answer_options_pkey" PRIMARY KEY ("participantAnswerId","answerOptionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_title_key" ON "categories"("title");

-- CreateIndex
CREATE UNIQUE INDEX "questions_quizId_order_key" ON "questions"("quizId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "answer_options_questionId_order_key" ON "answer_options"("questionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_sessions_roomCode_key" ON "quiz_sessions"("roomCode");

-- CreateIndex
CREATE UNIQUE INDEX "session_participants_sessionId_nickname_key" ON "session_participants"("sessionId", "nickname");

-- CreateIndex
CREATE UNIQUE INDEX "session_questions_sessionId_questionId_key" ON "session_questions"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "participant_answers_participantId_questionId_sessionId_key" ON "participant_answers"("participantId", "questionId", "sessionId");

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_categories" ADD CONSTRAINT "quiz_categories_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_categories" ADD CONSTRAINT "quiz_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_options" ADD CONSTRAINT "answer_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "quiz_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_questions" ADD CONSTRAINT "session_questions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "quiz_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_questions" ADD CONSTRAINT "session_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_answers" ADD CONSTRAINT "participant_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "quiz_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_answers" ADD CONSTRAINT "participant_answers_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "session_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_answers" ADD CONSTRAINT "participant_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_answer_options" ADD CONSTRAINT "participant_answer_options_participantAnswerId_fkey" FOREIGN KEY ("participantAnswerId") REFERENCES "participant_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_answer_options" ADD CONSTRAINT "participant_answer_options_answerOptionId_fkey" FOREIGN KEY ("answerOptionId") REFERENCES "answer_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
