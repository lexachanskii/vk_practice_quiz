import type { RequestHandler } from "express";
import { SessionStatus, UserRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const joinSessionSchema = z.object({
  roomCode: z.string().trim().min(4).max(12),
  nickname: z.string().trim().min(2).max(32),
});

function getStringParam(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function generateRoomCode(length = 6): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < length; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

async function generateUniqueRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const roomCode = generateRoomCode();

    const existingSession = await prisma.quizSession.findUnique({
      where: { roomCode },
    });

    if (!existingSession) {
      return roomCode;
    }
  }

  throw new Error("Failed to generate unique room code");
}

export const startQuizSession: RequestHandler = async (req, res) => {
  try {
    const quizId = getStringParam(req.params.id);

    if (!quizId) {
      res.status(400).json({ message: "Invalid quiz id" });
      return;
    }

    if (!req.user || req.user.role !== UserRole.ORGANIZER) {
      res.status(403).json({ message: "Only organizers can start quiz sessions" });
      return;
    }

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        organizerId: req.user.id,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    if (quiz.questions.length === 0) {
      res.status(400).json({ message: "Quiz must have at least one question" });
      return;
    }

    const invalidQuestion = quiz.questions.find((question) => {
      const correctCount = question.options.filter((option) => option.isCorrect).length;

      if (question.options.length < 2) {
        return true;
      }

      if (question.type === "SINGLE_CHOICE" && correctCount !== 1) {
        return true;
      }

      if (question.type === "MULTIPLE_CHOICE" && correctCount < 1) {
        return true;
      }

      return false;
    });

    if (invalidQuestion) {
      res.status(400).json({
        message: "Quiz contains invalid questions. Check answer options and correct answers.",
        questionId: invalidQuestion.id,
      });
      return;
    }

    const roomCode = await generateUniqueRoomCode();

    const session = await prisma.quizSession.create({
      data: {
        quizId: quiz.id,
        roomCode,
        status: SessionStatus.WAITING,
        questions: {
          create: quiz.questions.map((question) => ({
            questionId: question.id,
          })),
        },
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            defaultTimeLimitSeconds: true,
            pointsPerQuestion: true,
          },
        },
        participants: true,
        questions: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                imageUrl: true,
                type: true,
                order: true,
                timeLimitSeconds: true,
                points: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: "Quiz session created successfully",
      session,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const joinSession: RequestHandler = async (req, res) => {
  try {
    const validation = joinSessionSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: "Validation error",
        errors: validation.error.flatten(),
      });
      return;
    }

    const roomCode = validation.data.roomCode.toUpperCase();
    const nickname = validation.data.nickname.trim();

    const session = await prisma.quizSession.findUnique({
      where: {
        roomCode,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        participants: true,
      },
    });

    if (!session) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    if (
      session.status === SessionStatus.FINISHED ||
      session.status === SessionStatus.CANCELLED
    ) {
      res.status(400).json({ message: "Quiz session is already finished" });
      return;
    }

    const existingParticipantWithNickname = await prisma.sessionParticipant.findFirst({
      where: {
        sessionId: session.id,
        nickname,
      },
    });

    if (existingParticipantWithNickname) {
      res.status(409).json({ message: "Nickname is already taken in this room" });
      return;
    }

    const participant = await prisma.sessionParticipant.create({
      data: {
        sessionId: session.id,
        userId: req.user?.id,
        nickname,
      },
    });

    res.status(201).json({
      message: "Joined session successfully",
      session: {
        id: session.id,
        roomCode: session.roomCode,
        status: session.status,
        quiz: session.quiz,
      },
      participant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSessionResults: RequestHandler = async (req, res) => {
  try {
    const sessionId = getStringParam(req.params.id);

    if (!sessionId) {
      res.status(400).json({ message: "Invalid session id" });
      return;
    }

    const session = await prisma.quizSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            questions: {
              select: {
                id: true,
              },
            },
          },
        },
        participants: {
          include: {
            answers: {
              select: {
                isCorrect: true,
                pointsAwarded: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    const leaderboard = session.participants
      .map((participant) => {
        const correctAnswersCount = participant.answers.filter(
          (answer) => answer.isCorrect
        ).length;

        return {
          id: participant.id,
          nickname: participant.nickname,
          score: participant.score,
          correctAnswersCount,
          totalAnswersCount: participant.answers.length,
          joinedAt: participant.joinedAt,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((participant, index) => ({
        place: index + 1,
        ...participant,
      }));

    const averageScore =
      leaderboard.length > 0
        ? leaderboard.reduce((sum, participant) => sum + participant.score, 0) /
          leaderboard.length
        : 0;

    res.json({
      session: {
        id: session.id,
        roomCode: session.roomCode,
        status: session.status,
        startedAt: session.startedAt,
        finishedAt: session.finishedAt,
        createdAt: session.createdAt,
        quiz: {
          id: session.quiz.id,
          title: session.quiz.title,
          description: session.quiz.description,
          questionsCount: session.quiz.questions.length,
        },
      },
      stats: {
        participantsCount: leaderboard.length,
        averageScore,
        winner: leaderboard[0] ?? null,
      },
      leaderboard,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};