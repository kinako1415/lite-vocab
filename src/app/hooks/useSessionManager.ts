"use client";
import { useEffect, useCallback } from "react";
import { checkAndRefreshSession } from "../utils/sessionManager";

export function useSessionManager() {
  const checkSession = useCallback(async () => {
    const isValid = await checkAndRefreshSession();
    if (!isValid) {
      console.log(
        "セッションが無効です。サインインページにリダイレクトします。"
      );
      window.location.href = "/signin";
    }
  }, []);

  useEffect(() => {
    // 初回チェック
    checkSession();

    // 30分ごとにセッションをチェック
    const intervalId = setInterval(checkSession, 30 * 60 * 1000);

    // ページフォーカス時にセッションをチェック
    const handleFocus = () => {
      checkSession();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkSession]);

  return { checkSession };
}
