import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";

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
    .then((userCredential) => {
      const user = userCredential.user;

      console.log("登録成功した！！！！");
      console.log(user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.log(errorCode, errorMessage);
      console.log("登録失敗した！！！！");
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

      console.log("サインイン成功した！！！！");
      console.log(user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.log("エラー出た！！！！");
      console.log(errorCode, errorMessage);
    });
};
