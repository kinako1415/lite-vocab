import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import {
  actionsCreateSessionCookie,
  AsyncResult,
} from "@/app/actions/createSessionCookie";
import { FirebaseError } from "firebase/app";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export const CreateUser = async ({
  email,
  password,
}: {
  email: string | undefined;
  password: string | undefined;
}) => {
  if (email === undefined || password == undefined) {
    throw new Error("emailまたはpasswordが未設定です。流石に設定しろ!!!!!");
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      const userData = {
        email: user.email ?? "", // email が null じゃないことを保証
        userId: user.uid,
        createdAt: serverTimestamp(), // 必ず serverTimestamp を使う
      };

      // ✅ データを確認してから送ると良い
      console.log("Firestoreに登録するユーザー情報:", userData);

      await setDoc(doc(db, "users", user.uid), userData);

      console.log("ユーザー登録 & Firestore登録 完了:", user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.log(errorCode, errorMessage);
    });
};

export const SignIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  if (email === undefined || password == undefined) {
    throw new Error(
      "ログインするのにemailとかpassword入力してないわけないよね？？？？"
    );
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      console.log(user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.log(errorCode, errorMessage);
    });
};

const googleProvider = new GoogleAuthProvider();

export const SignInWithGoogle = async (): Promise<
  AsyncResult<{ user: User }>
> => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const idToken = await userCredential.user.getIdToken();
    const response = await actionsCreateSessionCookie(idToken);

    if (!response.success) {
      return { success: false, error: response.error };
    }
    return {
      success: true,
      data: { user: userCredential.user },
    };
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error(error.code);
    }
    return { success: false, error: "認証処理に失敗しました" };
  }
};
