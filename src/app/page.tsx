"use client";
import ModalWindow from "@/components/ModalWindow";
import { CreateUser, SignIn } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { addWord } from "@/lib/firestore";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

export default function Home() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const aEmail = "tomatog29@gmail.com";
  const aPassword = "831Hakudamono";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // クリーンアップ
  }, []);

  if (auth.currentUser !== null) {
    return (
      <div>
        <div>{auth.currentUser.email}</div>{" "}
        <button
          onClick={() => {
            auth.signOut();
          }}
        >
          サインアウトかも
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => {
          addWord();
        }}
      >
        単語の追加！！
      </button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          CreateUser({ email, password });
        }}
      >
        <input
          type="text"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <input
          type="text"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <button type="submit">ユーザー登録</button>
      </form>
      <button
        onClick={() => {
          setIsOpen(true);
        }}
      >
        モーーーーだる
      </button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          SignIn({ email: aEmail, password: aPassword });
        }}
      >
        <button type="submit">サインインかも</button>
      </form>

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
    </div>
  );
}
