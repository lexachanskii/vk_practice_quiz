import { apiFetch } from "@/lib/api";

export type UploadImageResponse = {
  message: string;
  imageUrl: string;
  file: {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
  };
};

export async function uploadQuestionImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const data = await apiFetch<UploadImageResponse>("/uploads/question-image", {
    method: "POST",
    auth: true,
    body: formData,
  });

  return data.imageUrl;
}