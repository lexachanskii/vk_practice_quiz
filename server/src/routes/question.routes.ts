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

router.use(authMiddleware);
router.use(roleMiddleware([UserRole.ORGANIZER]));

router.post("/quizzes/:quizId/questions", createQuestion);
router.patch("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

export default router;