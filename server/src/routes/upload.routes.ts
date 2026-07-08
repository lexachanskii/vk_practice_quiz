import { Router } from "express";
import multer from "multer";
import { UserRole } from "@prisma/client";
import { uploadQuestionImage } from "../controllers/upload.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { questionImageUpload } from "../middlewares/upload.middleware";

const router = Router();

router.post(
  "/question-image",
  authMiddleware,
  roleMiddleware([UserRole.ORGANIZER]),
  (req, res, next) => {
    questionImageUpload(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ message: "File is too large. Max size is 5 MB" });
          return;
        }

        res.status(400).json({ message: error.message });
        return;
      }

      if (error) {
        res.status(400).json({ message: error.message });
        return;
      }

      next();
    });
  },
  uploadQuestionImage
);

export default router;