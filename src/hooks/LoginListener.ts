"use client";
import { onAuthStateChanged, User } from "firebase/auth";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { auth } from "./../lib/firebase";

const LoginListener = () => {
  const [, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdToken().then((token) => {
          // トークンを取得してcookieに保存
          Cookies.set("authToken", token, {
            expires: 7,
            path: "",
            secure: true,
            sameSite: "Strict",
          });
        });
        setUser(user);
      } else {
        Cookies.remove("authToken");
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
};

export default LoginListener;
