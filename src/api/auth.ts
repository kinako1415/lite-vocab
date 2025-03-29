import { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "./firebaseAdmin";
import { cookies } from "next/headers"; // App Router の場合はこれを使用

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const token = req.body.token;
    if (!token) return res.status(401).json({ error: "No token provided" });

    // トークンの検証
    const decodedToken = await admin.auth().verifyIdToken(token);
    return res.status(200).json({ uid: decodedToken.uid });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
