import { atom } from "jotai";

interface Box {
  id: string;
}

export const boxesAtom = atom<Box[]>();
