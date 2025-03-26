"use server";

import { cookies } from "next/headers";

export interface AsyncResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function deleteSessionCookie(): Promise<AsyncResult> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { success: true };
}
