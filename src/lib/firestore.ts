import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export const addBox = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("ログインしていません");
    }

    await addDoc(collection(db, "users", user.uid, "boxes"), {
      createdAt: serverTimestamp(),
      name: "単語まとめ",
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
