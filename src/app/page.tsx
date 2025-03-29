"use client";
import ModalWindow from "@/components/ModalWindow";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { addWord } from "@/lib/firestore";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { deleteSessionCookie } from "./actions/deleteSessionCookie";
import Button from "@/components/elements/Button";

export default function Home() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log("現在のユーザー:", currentUser);
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
      <button
        onClick={() => {
          addWord();
        }}
      >
        単語の追加！！
      </button>

      <ModalWindow setIsOpen={setIsOpen} isOpen={isOpen}>
        <h1>title</h1>
        <h2>subtitle</h2>
        aiueo
        <br />
        korehakekkouiikannzino
        <br />
        mo-daruwindowdehanainndesuka?
        <br />
        <br />
        <br />
      </ModalWindow>
      <div>
        <button
          onClick={() => {
            handleSignOut();
          }}
        >
          サインアウトかも
        </button>
      </div>
      <div>{user ? user.email : ""}</div>
      <Button>Sign Up</Button>
    </div>
  );
}
