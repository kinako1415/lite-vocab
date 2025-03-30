import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z.string().email("これはメールアドレス？？"),
    password: z
      .string()
      .min(6, "秘密のパスワードは6文字以上!!")
      .regex(/^[\x20-\x7E]+$/, "英語か数字か記号以外はダメ!!!!"),
    passwordConfirm: z.string().min(1, "何も入力してないわけないよね？？"),
  })
  .superRefine(({ password, passwordConfirm }, ctx) => {
    if (password !== passwordConfirm) {
      ctx.addIssue({
        path: ["passwordConfirm"],
        code: "custom",
        message: "同じ秘密のパスワードを入力してね!!",
      });
    }
  });

export type signUpValue = z.infer<typeof signUpSchema>;
