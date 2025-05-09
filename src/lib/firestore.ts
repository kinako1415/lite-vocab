import {
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { converter } from "./converter";
import { Boxes } from "@/types/boxes";
import { Words } from "@/types/word";

export const addBox = async (name: string) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("ログインしていません");
    }

    await addDoc(collection(db, "users", user.uid, "boxes"), {
      createdAt: serverTimestamp(),
      name: name,
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const deleteBox = async (boxesId: string) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("ログインしていません");
    }

    await deleteDoc(doc(db, "users", user.uid, "boxes", boxesId));
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const getBox = async (): Promise<Boxes[]> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("ログインしていません");
    }

    const docSnap = await getDocs(
      collection(db, "users", user.uid, "boxes").withConverter(
        converter<Boxes>()
      )
    );

    const boxes = docSnap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((box): box is Boxes => !!box.createdAt && !!box.name);

    console.log(boxes);

    return boxes;
  } catch (e) {
    console.error("Error adding document: ", e);
    return [];
  }
};

export const getWord = async (boxesId: string): Promise<Words[]> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("ログインしていません");
    }

    const docSnap = await getDocs(
      collection(
        db,
        "users",
        user.uid,
        "boxes",
        boxesId,
        "words"
      ).withConverter(converter<Words>())
    );

    const words = docSnap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((box): box is Words => !!box.createdAt);

    console.log(words);

    return words;
  } catch (e) {
    console.error("Error adding document: ", e);
    return [];
  }
};

export const addWord = async (
  word: string,
  meaning: string,
  boxesId: string
) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("ログインしていません");
    }

    await addDoc(collection(db, "users", user.uid, "boxes", boxesId, "words"), {
      createdAt: serverTimestamp(),
      word: word,
      meaning: meaning,
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
