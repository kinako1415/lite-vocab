import { BoxesWithWords } from "@/types/boxes";
import { atom } from "jotai";

export const boxesAtom = atom<BoxesWithWords[]>();
export const activeBoxesAtom = atom<string | undefined>(undefined);
