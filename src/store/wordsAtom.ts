import { Words } from "@/types/word";
import { atom } from "jotai";

export const wordsCacheAtom = atom<Record<string, Words[]>>({});
