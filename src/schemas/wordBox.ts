import { z } from "zod";

export const wordBoxSchema = z.object({
  name: z.string().min(1, "0文字だよ?しっかり入力して!!!"),
});

export type wordBoxValue = z.infer<typeof wordBoxSchema>;
