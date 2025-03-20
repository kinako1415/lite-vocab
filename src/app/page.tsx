"use client";
import { addWord } from "@/lib/firestore";

export default function Home() {
  return (
    <div>
      <button
        onClick={() => {
          addWord();
        }}
      >
        単語の追加！！
      </button>
    </div>
  );
}
