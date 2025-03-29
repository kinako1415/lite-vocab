import { auth } from "./firebase";
import Cookies from "js-cookie";

const getIdTokenAuth = async () => {
  const user = auth.currentUser;

  if (user) {
    try {
      const token = await user.getIdToken(true);
      Cookies.set("authToken", token, {
        expires: 7,
        path: "/",
        secure: true,
        sameSite: "Strict",
      });
      return token;
    } catch (error) {
      console.log("Failed to get ID token:", error);
      return null;
    }
  }
  return null;
};

export default getIdTokenAuth;
