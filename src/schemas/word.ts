import { z } from "zod";

export const wordSchemas = z.object({
  meaning: z
    .string()
    .min(1, "意味を追加してください")
    .max(50, "50文字以下にしてください"),
  word: z
    .string()
    .min(1, "単語を追加してください")
    .max(50, "50文字以下にしてください"),
});
