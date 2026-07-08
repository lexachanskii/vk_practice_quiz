import { Router } from "express";
import { UserRole } from "@prisma/client";
import {
  getSessionResults,
  joinSession,
  startQuizSession,
  getMyOrganizedSessions,
} from "../controllers/session.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { optionalAuthMiddleware } from "../middlewares/optional-auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.post(
  "/quizzes/:id/start",
  authMiddleware,
  roleMiddleware([UserRole.ORGANIZER]),
  startQuizSession
);

router.post("/sessions/join", optionalAuthMiddleware, joinSession);

router.get("/sessions/:id/results", getSessionResults);

router.get(
  "/sessions/my-organized",
  authMiddleware,
  roleMiddleware([UserRole.ORGANIZER]),
  getMyOrganizedSessions
);

export default router;