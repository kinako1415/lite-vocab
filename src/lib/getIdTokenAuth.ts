import { auth } from "./firebase";

const getIdTokenAuth = async () => {
  const user = auth.currentUser;

  if (user) {
    try {
      const token = user.getIdToken(true);
      return token;
    } catch (error) {
      console.log("Failed to get ID token:", error);
      return null;
    }
  }
  return null;
};

export default getIdTokenAuth;
