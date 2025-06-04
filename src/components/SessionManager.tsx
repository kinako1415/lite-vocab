"use client";
import { useEffect } from "react";
import { useSessionManager } from "../app/hooks/useSessionManager";

export function SessionManager() {
  const { checkSession } = useSessionManager();

  useEffect(() => {
    // アプリ起動時に1回セッションをチェック
    checkSession();
  }, [checkSession]);

  return null; // UIは不要
}

export default SessionManager;
