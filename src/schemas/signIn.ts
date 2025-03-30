import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("これはメールアドレス？？"),
  password: z.string().min(1, "何か入力して!!!!!!"),
});

export type signInValue = z.infer<typeof signInSchema>;
