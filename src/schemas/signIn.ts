import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("これはメールアドレス??"),
  password: z
    .string()
    .min(1, "0文字だよ?しっかり入力して!!!")
    .min(6, "登録するとき6文字以上だった気がする")
    .regex(/^[\x20-\x7E]+$/, "英語か数字か記号以外は設定できないはず!!!!"),
});

export type signInValue = z.infer<typeof signInSchema>;
