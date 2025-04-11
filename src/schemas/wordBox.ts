import { z } from "zod";

export const wordBoxSchema = z.object({
  name: z
    .string()
    .min(1, "0文字だよ?しっかり入力して!!!")
    .max(50, "結構な文字数だね減らして!!!"),
});

export type wordBoxValue = z.infer<typeof wordBoxSchema>;
