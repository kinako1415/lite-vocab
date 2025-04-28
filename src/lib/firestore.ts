import {
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "./firebase";

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

export const getBox = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("ログインしていません");
    }

    const docSnap = await getDocs(collection(db, "users", user.uid, "boxes"));

    const boxes = docSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(boxes);

    return boxes;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
