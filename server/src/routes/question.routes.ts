import { Router } from "express";
import { UserRole } from "@prisma/client";
import {
  createQuestion,
  deleteQuestion,
  updateQuestion,
} from "../controllers/question.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.post(
  "/quizzes/:quizId/questions",
  authMiddleware,
  roleMiddleware([UserRole.ORGANIZER]),
  createQuestion
);

router.patch(
  "/questions/:id",
  authMiddleware,
  roleMiddleware([UserRole.ORGANIZER]),
  updateQuestion
);

router.delete(
  "/questions/:id",
  authMiddleware,
  roleMiddleware([UserRole.ORGANIZER]),
  deleteQuestion
);

export default router;