"use client";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { deleteSessionCookie } from "./actions/deleteSessionCookie";
import styles from "./page.module.scss";
import { addBox } from "@/lib/firestore";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await deleteSessionCookie();
      router.push("/");
      return { success: true };
    } catch (error) {
      console.log("Sign out error:", error);
      return { success: false, error: "サインアウトに失敗しました" };
    }
  };

  return (
    <div>
      <div>
        <button
          onClick={() => {
            handleSignOut();
          }}
        >
          サインアウトかも
        </button>
        <div
          className={`${styles.boxContainer} ${isActive && styles.active}`}
          onClick={() => {
            setIsActive(!isActive);
          }}
        >
          ☺️形容詞まとめ
        </div>
        <button
          onClick={() => {
            addBox();
          }}
        >
          あいうえおかきくけこ
        </button>
      </div>
      <div>{user ? user.email : ""}</div>
    </div>
  );
}
