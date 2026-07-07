import { Router } from "express";
import { UserRole } from "@prisma/client";
import {
  createQuiz,
  deleteQuiz,
  getMyQuizzes,
  getQuizById,
  updateQuiz,
} from "../controllers/quiz.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware([UserRole.ORGANIZER]));

router.post("/", createQuiz);
router.get("/my", getMyQuizzes);
router.get("/:id", getQuizById);
router.patch("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);

export default router;