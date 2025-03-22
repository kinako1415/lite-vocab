import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export const CreateUser = ({
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

      console.log(user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.log(errorCode, errorMessage);
    });
};
