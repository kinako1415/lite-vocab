import { Boxes } from "@/types/boxes";
import { atom } from "jotai";

export const boxesAtom = atom<Boxes[]>();
export const activeBoxesAtom = atom<string | undefined>(undefined);
