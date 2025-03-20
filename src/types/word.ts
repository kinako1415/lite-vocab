import { z } from "zod";
import { wordSchemas } from "@/schemas/word";

export type Word = z.infer<typeof wordSchemas>;
