"use client";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { deleteSessionCookie } from "./actions/deleteSessionCookie";
import styles from "./page.module.scss";
import { Button } from "@/components/elements/Button";
import { Left } from "@/components/page/Left";
import { useSetAtom } from "jotai";
import { boxesAtom } from "@/store/boxesAtom";
import { getBox } from "@/lib/firestore";

export default function Home() {
  const [, setUser] = useState<User | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const router = useRouter();
  const setBoxes = useSetAtom(boxesAtom);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setBoxes(getBox());
    });

    return () => unsubscribe();
  }, []);

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
      <div
        style={{
          display: "flex",
          width: "100vw",
          height: "100vh",
        }}
      >
        <Left />
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexDirection: "column",
            width: "100%",
            padding: "16px",
            backgroundColor: "#FFFFFF",
            borderRadius: "32px 0 0 32px",
          }}
        >
          <Button
            color="gray"
            onClick={() => {
              handleSignOut();
            }}
          >
            サインアウトかも
          </Button>
          <div
            className={`${styles.boxContainer} ${isActive && styles.active}`}
            onClick={() => {
              setIsActive(!isActive);
            }}
          >
            ☺️ 形容詞まとめ
          </div>
        </div>
      </div>
    </div>
  );
}
