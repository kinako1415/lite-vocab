import { z } from "zod";
import { wordSchemas } from "@/schemas/word";
import { Timestamp } from "firebase/firestore";

export type WordsValue = z.infer<typeof wordSchemas>;

export type Words = z.infer<typeof wordSchemas> & {
  id: string;
  createdAt?: Timestamp;
};
