import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export const addWord = async () => {
  try {
    const docRef = await addDoc(collection(db, "words"), {
      word: "friend",
      meaning: "ともだち",
    });
    console.log("Document written", docRef);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
