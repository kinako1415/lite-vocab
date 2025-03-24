import admin from "firebase-admin";
import { auth } from "./firebase";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!)
    ),
  });
}

export const verifyIdToken = (token: string) => {
  return admin.auth().verifyIdToken(token);
};

auth.currentUser?.getIdToken().then((token) => {
  fetch("/api/set-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "include", // Cookie を送受信するために必要
  });
});
