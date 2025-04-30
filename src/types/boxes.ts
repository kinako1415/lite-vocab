import { Timestamp } from "firebase/firestore";

export interface Boxes {
  createdAt?: Timestamp;
  name: string;
  id: string;
}
