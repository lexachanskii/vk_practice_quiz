import multer from "multer";
import * as fs from "fs";
import * as path from "path";

const uploadDir = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "uploads",
  "question-images"
);

fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDir);
  },

  filename: (req, file, callback) => {
    const extension =
      path.extname(file.originalname).toLowerCase() ||
      extensionByMimeType[file.mimetype] ||
      "";

    const filename = `question-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    callback(null, filename);
  },
});

export const questionImageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error("Only JPEG, PNG, WEBP and GIF images are allowed"));
      return;
    }

    callback(null, true);
  },
}).single("image");