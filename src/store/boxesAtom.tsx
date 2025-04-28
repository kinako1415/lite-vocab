import { atom } from "jotai";

interface boxesProp {
  createdAt: string;
  id: string;
  name: string;
}

export const boxesAtom = atom<boxesProp[]>([]);
