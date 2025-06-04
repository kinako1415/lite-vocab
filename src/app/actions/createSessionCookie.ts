"use server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";
// import { AsyncResult } from "../../types/result";

const setSessionCookie = async (sessionCookie: string, maxAge: number) => {
  const cookieStore = await cookies();
  cookieStore.set("session", sessionCookie, {
    maxAge: maxAge / 1000, // seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

export interface AsyncResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function actionsCreateSessionCookie(
  idToken: string
): Promise<AsyncResult> {
  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    await setSessionCookie(sessionCookie, expiresIn);
    return { success: true };
  } catch (error) {
    console.log("Session cookie creation failed:", error);
    return { success: false, error: "セッションの作成に失敗しました" };
  }
}
