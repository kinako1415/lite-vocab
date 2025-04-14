import type {
  PartialWithFieldValue,
  QueryDocumentSnapshot,
} from "firebase/firestore";

// ref: https://stackoverflow.com/questions/74486413
export const converter = <T>() => ({
  toFirestore: (data: PartialWithFieldValue<T>) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
});
