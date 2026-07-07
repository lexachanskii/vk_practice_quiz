import type { RequestHandler } from "express";
import { QuizStatus, UserRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const createQuizSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters"),
  description: z.string().trim().optional(),
  defaultTimeLimitSeconds: z.number().int().positive().optional(),
  pointsPerQuestion: z.number().int().positive().optional(),
  categories: z.array(z.string().trim().min(1)).optional(),
});

const updateQuizSchema = z.object({
  title: z.string().trim().min(2).optional(),
  description: z.string().trim().optional(),
  status: z.enum([
    QuizStatus.DRAFT,
    QuizStatus.PUBLISHED,
    QuizStatus.ARCHIVED,
  ]).optional(),
  defaultTimeLimitSeconds: z.number().int().positive().optional(),
  pointsPerQuestion: z.number().int().positive().optional(),
  categories: z.array(z.string().trim().min(1)).optional(),
});

function normalizeCategories(categories?: string[]) {
  if (!categories) {
    return [];
  }

  return [...new Set(categories.map((category) => category.trim()).filter(Boolean))];
}

export const createQuiz: RequestHandler = async (req, res) => {
  try {
    if (!req.user || req.user.role !== UserRole.ORGANIZER) {
      res.status(403).json({ message: "Only organizers can create quizzes" });
      return;
    }

    const validation = createQuizSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: "Validation error",
        errors: validation.error.flatten(),
      });
      return;
    }

    const {
      title,
      description,
      defaultTimeLimitSeconds,
      pointsPerQuestion,
      categories,
    } = validation.data;

    const normalizedCategories = normalizeCategories(categories);

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        defaultTimeLimitSeconds: defaultTimeLimitSeconds ?? 30,
        pointsPerQuestion: pointsPerQuestion ?? 100,
        organizerId: req.user.id,
        categories: {
          create: normalizedCategories.map((categoryTitle) => ({
            category: {
              connectOrCreate: {
                where: { title: categoryTitle },
                create: { title: categoryTitle },
              },
            },
          })),
        },
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            questions: true,
            sessions: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyQuizzes: RequestHandler = async (req, res) => {
  try {
    if (!req.user || req.user.role !== UserRole.ORGANIZER) {
      res.status(403).json({ message: "Only organizers can view their quizzes" });
      return;
    }

    const quizzes = await prisma.quiz.findMany({
      where: {
        organizerId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            questions: true,
            sessions: true,
          },
        },
      },
    });

    res.json({ quizzes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getQuizById: RequestHandler = async (req, res) => {
  try {
    if (!req.user || req.user.role !== UserRole.ORGANIZER) {
      res.status(403).json({ message: "Only organizers can view quiz details" });
      return;
    }

    const id = req.params.id;

    if (typeof id !== "string") {
        res.status(400).json({ message: "Invalid quiz id" });
        return;
    }   

    const quiz = await prisma.quiz.findFirst({
      where: {
        id,
        organizerId: req.user.id,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        questions: {
          orderBy: {
            order: "asc",
          },
          include: {
            options: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
        sessions: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            roomCode: true,
            status: true,
            startedAt: true,
            finishedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    res.json({ quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateQuiz: RequestHandler = async (req, res) => {
  try {
    if (!req.user || req.user.role !== UserRole.ORGANIZER) {
      res.status(403).json({ message: "Only organizers can update quizzes" });
      return;
    }

    const id = req.params.id;

    if (typeof id !== "string") {
        res.status(400).json({ message: "Invalid quiz id" });
        return;
    }   

    const validation = updateQuizSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: "Validation error",
        errors: validation.error.flatten(),
      });
      return;
    }

    const existingQuiz = await prisma.quiz.findFirst({
      where: {
        id,
        organizerId: req.user.id,
      },
    });

    if (!existingQuiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    const {
      title,
      description,
      status,
      defaultTimeLimitSeconds,
      pointsPerQuestion,
      categories,
    } = validation.data;

    const updatedQuiz = await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status }),
          ...(defaultTimeLimitSeconds !== undefined && {
            defaultTimeLimitSeconds,
          }),
          ...(pointsPerQuestion !== undefined && { pointsPerQuestion }),
        },
      });

      if (categories !== undefined) {
        const normalizedCategories = normalizeCategories(categories);

        await tx.quizCategory.deleteMany({
          where: {
            quizId: id,
          },
        });

        if (normalizedCategories.length > 0) {
          await Promise.all(
            normalizedCategories.map(async (categoryTitle) => {
              const category = await tx.category.upsert({
                where: {
                  title: categoryTitle,
                },
                update: {},
                create: {
                  title: categoryTitle,
                },
              });

              await tx.quizCategory.create({
                data: {
                  quizId: id,
                  categoryId: category.id,
                },
              });
            })
          );
        }
      }

      return tx.quiz.findUnique({
        where: { id: quiz.id },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          _count: {
            select: {
              questions: true,
              sessions: true,
            },
          },
        },
      });
    });

    res.json({
      message: "Quiz updated successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteQuiz: RequestHandler = async (req, res) => {
  try {
    if (!req.user || req.user.role !== UserRole.ORGANIZER) {
      res.status(403).json({ message: "Only organizers can delete quizzes" });
      return;
    }

    const id = req.params.id;

    if (typeof id !== "string") {
        res.status(400).json({ message: "Invalid quiz id" });
        return;
    }   

    const existingQuiz = await prisma.quiz.findFirst({
      where: {
        id,
        organizerId: req.user.id,
      },
    });

    if (!existingQuiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    await prisma.quiz.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};