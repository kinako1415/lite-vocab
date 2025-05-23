import {
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  getDoc,
  onSnapshot,
  Unsubscribe,
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

    return words;
  } catch (e) {
    console.error("Error fetching words: ", e);
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

export const subscribeToBoxesWithWords = (
  onUpdate: (boxes: Boxes[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("ログインしていません");

    // ボックスの変更を監視
    const unsubscribeBoxes = onSnapshot(
      collection(db, "users", user.uid, "boxes").withConverter(
        converter<Boxes>()
      ),
      async (boxesSnapshot) => {
        try {
          const boxes = boxesSnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((box): box is Boxes => !!box.createdAt && !!box.name);

          // 各ボックスの単語を並列で取得
          const boxesWithWords = await Promise.all(
            boxes.map(async (box) => {
              const wordsSnapshot = await getDocs(
                collection(
                  db,
                  "users",
                  user.uid,
                  "boxes",
                  box.id,
                  "words"
                ).withConverter(converter<Words>())
              );

              const words = wordsSnapshot.docs
                .map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }))
                .filter((word): word is Words => !!word.createdAt);

              return { ...box, words };
            })
          );

          onUpdate(boxesWithWords);
        } catch (error) {
          onError(error instanceof Error ? error : new Error("Unknown error"));
        }
      },
      (error) => {
        onError(error instanceof Error ? error : new Error("Unknown error"));
      }
    );

    return () => {
      unsubscribeBoxes();
    };
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Unknown error"));
    return () => {}; // エラー時は空のクリーンアップ関数を返す
  }
};
