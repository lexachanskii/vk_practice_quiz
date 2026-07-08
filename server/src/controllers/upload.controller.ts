import type { RequestHandler } from "express";

export const uploadQuestionImage: RequestHandler = (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "Image file is required" });
    return;
  }

  const imageUrl = `/uploads/question-images/${req.file.filename}`;

  res.status(201).json({
    message: "Image uploaded successfully",
    imageUrl,
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
};