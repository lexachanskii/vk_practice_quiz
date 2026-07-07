import type { RequestHandler } from "express";
import { QuestionType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const answerOptionSchema = z
  .object({
    text: z.string().trim().optional(),
    imageUrl: z.string().trim().optional(),
    isCorrect: z.boolean().optional().default(false),
    order: z.number().int().positive().optional(),
  })
  .refine((data) => data.text || data.imageUrl, {
    message: "Answer option must contain text or imageUrl",
  });

const createQuestionSchema = z
  .object({
    text: z.string().trim().optional(),
    imageUrl: z.string().trim().optional(),
    type: z.enum([QuestionType.SINGLE_CHOICE, QuestionType.MULTIPLE_CHOICE]),
    order: z.number().int().positive().optional(),
    timeLimitSeconds: z.number().int().positive().optional(),
    points: z.number().int().positive().optional(),
    options: z.array(answerOptionSchema).min(2, "Question must have at least 2 answer options"),
  })
  .refine((data) => data.text || data.imageUrl, {
    message: "Question must contain text or imageUrl",
  });

const updateQuestionSchema = z
  .object({
    text: z.string().trim().optional(),
    imageUrl: z.string().trim().optional(),
    type: z.enum([QuestionType.SINGLE_CHOICE, QuestionType.MULTIPLE_CHOICE]).optional(),
    order: z.number().int().positive().optional(),
    timeLimitSeconds: z.number().int().positive().optional(),
    points: z.number().int().positive().optional(),
    options: z.array(answerOptionSchema).min(2, "Question must have at least 2 answer options").optional(),
  });

type NormalizedOption = {
  text?: string;
  imageUrl?: string;
  isCorrect: boolean;
  order: number;
};

function getStringParam(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function normalizeOptions(
  options: z.infer<typeof answerOptionSchema>[]
): NormalizedOption[] {
  return options.map((option, index) => ({
    text: option.text,
    imageUrl: option.imageUrl,
    isCorrect: option.isCorrect ?? false,
    order: option.order ?? index + 1,
  }));
}

function hasDuplicateOrders(options: NormalizedOption[]): boolean {
  const orders = options.map((option) => option.order);
  return new Set(orders).size !== orders.length;
}

function validateCorrectOptions(
  type: QuestionType,
  options: Pick<NormalizedOption, "isCorrect">[]
): string | null {
  const correctCount = options.filter((option) => option.isCorrect).length;

  if (type === QuestionType.SINGLE_CHOICE && correctCount !== 1) {
    return "Single choice question must have exactly one correct answer";
  }

  if (type === QuestionType.MULTIPLE_CHOICE && correctCount < 1) {
    return "Multiple choice question must have at least one correct answer";
  }

  return null;
}

export const createQuestion: RequestHandler = async (req, res) => {
  try {
    const quizId = getStringParam(req.params.quizId);

    if (!quizId) {
      res.status(400).json({ message: "Invalid quiz id" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "User is not authorized" });
      return;
    }

    const validation = createQuestionSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: "Validation error",
        errors: validation.error.flatten(),
      });
      return;
    }

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        organizerId: req.user.id,
      },
    });

    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    const {
      text,
      imageUrl,
      type,
      order,
      timeLimitSeconds,
      points,
      options,
    } = validation.data;

    const normalizedOptions = normalizeOptions(options);

    if (hasDuplicateOrders(normalizedOptions)) {
      res.status(400).json({ message: "Answer options must have unique order values" });
      return;
    }

    const correctOptionsError = validateCorrectOptions(type, normalizedOptions);

    if (correctOptionsError) {
      res.status(400).json({ message: correctOptionsError });
      return;
    }

    let questionOrder = order;

    if (!questionOrder) {
      const maxOrderResult = await prisma.question.aggregate({
        where: { quizId },
        _max: { order: true },
      });

      questionOrder = (maxOrderResult._max.order ?? 0) + 1;
    } else {
      const questionWithSameOrder = await prisma.question.findFirst({
        where: {
          quizId,
          order: questionOrder,
        },
      });

      if (questionWithSameOrder) {
        res.status(409).json({ message: "Question with this order already exists" });
        return;
      }
    }

    const question = await prisma.question.create({
      data: {
        quizId,
        text,
        imageUrl,
        type,
        order: questionOrder,
        timeLimitSeconds,
        points,
        options: {
          create: normalizedOptions.map((option) => ({
            text: option.text,
            imageUrl: option.imageUrl,
            isCorrect: option.isCorrect,
            order: option.order,
          })),
        },
      },
      include: {
        options: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    res.status(201).json({
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateQuestion: RequestHandler = async (req, res) => {
  try {
    const id = getStringParam(req.params.id);

    if (!id) {
      res.status(400).json({ message: "Invalid question id" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "User is not authorized" });
      return;
    }

    const validation = updateQuestionSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: "Validation error",
        errors: validation.error.flatten(),
      });
      return;
    }

    const existingQuestion = await prisma.question.findFirst({
      where: {
        id,
        quiz: {
          organizerId: req.user.id,
        },
      },
      include: {
        options: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!existingQuestion) {
      res.status(404).json({ message: "Question not found" });
      return;
    }

    const {
      text,
      imageUrl,
      type,
      order,
      timeLimitSeconds,
      points,
      options,
    } = validation.data;

    const nextText = text !== undefined ? text : existingQuestion.text;
    const nextImageUrl = imageUrl !== undefined ? imageUrl : existingQuestion.imageUrl;

    if (!nextText && !nextImageUrl) {
      res.status(400).json({ message: "Question must contain text or imageUrl" });
      return;
    }

    if (order !== undefined && order !== existingQuestion.order) {
      const questionWithSameOrder = await prisma.question.findFirst({
        where: {
          quizId: existingQuestion.quizId,
          order,
          id: {
            not: id,
          },
        },
      });

      if (questionWithSameOrder) {
        res.status(409).json({ message: "Question with this order already exists" });
        return;
      }
    }

    const nextType = type ?? existingQuestion.type;

    const nextOptions = options
      ? normalizeOptions(options)
      : existingQuestion.options.map((option) => ({
          text: option.text ?? undefined,
          imageUrl: option.imageUrl ?? undefined,
          isCorrect: option.isCorrect,
          order: option.order,
        }));

    if (hasDuplicateOrders(nextOptions)) {
      res.status(400).json({ message: "Answer options must have unique order values" });
      return;
    }

    const correctOptionsError = validateCorrectOptions(nextType, nextOptions);

    if (correctOptionsError) {
      res.status(400).json({ message: correctOptionsError });
      return;
    }

    const updatedQuestion = await prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id },
        data: {
          ...(text !== undefined && { text }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(type !== undefined && { type }),
          ...(order !== undefined && { order }),
          ...(timeLimitSeconds !== undefined && { timeLimitSeconds }),
          ...(points !== undefined && { points }),
        },
      });

      if (options !== undefined) {
        await tx.answerOption.deleteMany({
          where: {
            questionId: id,
          },
        });

        await tx.answerOption.createMany({
          data: nextOptions.map((option) => ({
            questionId: id,
            text: option.text,
            imageUrl: option.imageUrl,
            isCorrect: option.isCorrect,
            order: option.order,
          })),
        });
      }

      return tx.question.findUnique({
        where: { id },
        include: {
          options: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    });

    res.json({
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteQuestion: RequestHandler = async (req, res) => {
  try {
    const id = getStringParam(req.params.id);

    if (!id) {
      res.status(400).json({ message: "Invalid question id" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "User is not authorized" });
      return;
    }

    const existingQuestion = await prisma.question.findFirst({
      where: {
        id,
        quiz: {
          organizerId: req.user.id,
        },
      },
    });

    if (!existingQuestion) {
      res.status(404).json({ message: "Question not found" });
      return;
    }

    await prisma.question.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};