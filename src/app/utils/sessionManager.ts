"use client";
import { auth } from "@/lib/firebase";
import { actionsCreateSessionCookie } from "../actions/createSessionCookie";

export async function refreshUserSession(): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("ユーザーがサインインしていません");
      return false;
    }

    // 新しいIDトークンを取得
    const idToken = await user.getIdToken(true); // true で強制的に新しいトークンを取得

    // 新しいセッションクッキーを作成
    const result = await actionsCreateSessionCookie(idToken);

    if (result.success) {
      console.log("セッションが正常に更新されました");
      return true;
    } else {
      console.error("セッション更新に失敗:", result.error);
      return false;
    }
  } catch (error) {
    console.error("セッション更新エラー:", error);
    return false;
  }
}

export async function checkAndRefreshSession(): Promise<boolean> {
  try {
    const response = await fetch("/api/verify", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      // セッションが無効な場合、更新を試行
      return await refreshUserSession();
    }

    const data = await response.json();

    // セッションの更新が推奨される場合
    if (data.shouldRefresh) {
      console.log("セッションの更新が推奨されています");
      return await refreshUserSession();
    }

    return true;
  } catch (error) {
    console.error("セッションチェックエラー:", error);
    return false;
  }
}
