import { Timestamp } from "firebase/firestore";
import { atom } from "jotai";

interface Boxes {
  createdAt: Timestamp;
  name: string;
  id: string;
}

export const boxesAtom = atom<Boxes[]>();
