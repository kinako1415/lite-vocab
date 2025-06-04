"use server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";

export interface AsyncResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function refreshSession(session: string): Promise<AsyncResult<{ newSession: string }>> {
  try {
    const cookieStore = await cookies();
    
    // 現在のセッションを検証
    const decodedToken = await adminAuth.verifySessionCookie(session, false);
    
    if (!decodedToken) {
      return { success: false, error: "無効なセッション" };
    }

    // 新しいセッションクッキーを作成
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5日間
    const newSessionCookie = await adminAuth.createSessionCookie(
      // IDトークンが必要ですが、セッションから直接は取得できないため、
      // 既存のセッションを延長する方法を使用
      await adminAuth.createCustomToken(decodedToken.uid),
      { expiresIn }
    );

    // 新しいセッションクッキーを設定
    cookieStore.set("session", newSessionCookie, {
      maxAge: expiresIn / 1000, // seconds
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    return { success: true, data: { newSession: newSessionCookie } };
  } catch (error) {
    console.log("セッション更新に失敗:", error);
    return { success: false, error: "セッションの更新に失敗しました" };
  }
}
