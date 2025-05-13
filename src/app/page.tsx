"use client";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { deleteSessionCookie } from "./actions/deleteSessionCookie";
import { Button } from "@/components/elements/Button";
import { Sidebar } from "@/components/page/sidebar/Sidebar";
import { useSetAtom } from "jotai";
import { boxesAtom } from "@/store/boxesAtom";
import { subscribeToBoxesWithWords } from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";
import { WordsContent } from "@/components/page/WordsContent";

export default function Home() {
  const router = useRouter();
  const setBoxes = useSetAtom(boxesAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // リアルタイムリスナーを設定
          const unsubscribeBoxes = subscribeToBoxesWithWords(
            (boxes) => {
              const sanitizedData = boxes.map((box) => ({
                ...box,
                createdAt: box.createdAt || new Timestamp(0, 0),
              }));
              setBoxes(sanitizedData);
              setIsLoading(false);
            },
            (error) => {
              console.error("Error in subscription:", error);
              setError(error);
              setIsLoading(false);
            }
          );

          // クリーンアップ関数を返す
          return () => {
            unsubscribeBoxes();
          };
        } catch (error) {
          console.error("Error setting up subscription:", error);
          setError(error instanceof Error ? error : new Error("Unknown error"));
          setIsLoading(false);
        }
      } else {
        setBoxes([]);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [setBoxes]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await deleteSessionCookie();
      router.push("/");
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return { success: false, error: "サインアウトに失敗しました" };
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // または適切なローディングコンポーネント
  }

  if (error) {
    return <div>Error: {error.message}</div>; // または適切なエラーコンポーネント
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          width: "100vw",
          height: "100vh",
        }}
      >
        <Sidebar />
        <div
          style={{
            position: "relative",
            display: "flex",
            gap: "16px",
            width: "100%",
            padding: "24px",
            backgroundColor: "#FFFFFF",
            borderRadius: "32px 0 0 0",
          }}
        >
          <WordsContent />
          <Button
            color="gray"
            onClick={() => {
              handleSignOut();
            }}
          >
            サインアウトします
          </Button>
        </div>
      </div>
    </div>
  );
}
