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
        email: user.email ?? "",
        userId: user.uid,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), userData);
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

    const userData = {
      email: userCredential.user.email ?? "",
      userId: userCredential.user.uid,
      createdAt: serverTimestamp(),
    };

    if (!response.success) {
      return { success: false, error: response.error };
    }

    await setDoc(doc(db, "users", userCredential.user.uid), userData);
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
