import {
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  getDoc,
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

export const updateWord = async (
  boxesId: string,
  wordId: string,
  word: string,
  meaning: string
) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("ログインしていません");

    const wordRef = doc(
      db,
      "users",
      user.uid,
      "boxes",
      boxesId,
      "words",
      wordId
    );

    const docSnap = await getDoc(wordRef);
    if (!docSnap.exists()) {
      throw new Error("単語が存在しません");
    }

    const existingCreatedAt = docSnap.data().createdAt;

    await updateDoc(wordRef, {
      word,
      meaning,
      createdAt: existingCreatedAt,
    });
  } catch (e) {
    console.error("Error updating word: ", e);
    throw e;
  }
};
