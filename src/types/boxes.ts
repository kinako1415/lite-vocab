import { Timestamp } from "firebase/firestore";
import { Words } from "./word";

export interface Boxes {
  createdAt?: Timestamp;
  name: string;
  id: string;
}

export interface BoxesWithWords extends Boxes {
  words: Words[];
}
