import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "./firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <トークン>" の "<トークン>" 部分を取得

  try {
    const decodedToken = await adminAuth.verifyIdToken(token); // Firebase Admin SDK でトークンを検証
    console.log("Authenticated user:", decodedToken);

    return res.status(200).json({ message: "Success", user: decodedToken });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token", error: error });
  }
}
