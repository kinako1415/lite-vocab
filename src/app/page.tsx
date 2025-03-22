"use client";
import { CreateUser } from "@/lib/auth";
import { addWord } from "@/lib/firestore";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();

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
        onSubmit={() => {
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
    </div>
  );
}
