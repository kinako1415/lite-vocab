import "server-only";
import type { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET(req: NextApiRequest) {
  try {
    const session = req.headers
      .get("Cookie")
      ?.split("session=")[1]
      ?.split(";")[0];

    if (!session) {
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    // console.log("セッション  :  ", session);

    const decodedToken = await adminAuth.verifySessionCookie(session, true);

    // console.log("デコデッドトークン  :  ", decodedToken);
    // console.log("デコデッドトークンアドミン  :  ", decodedToken.admin);

    if (!decodedToken) {
      return NextResponse.json({ isValid: false }, { status: 403 });
    }
    return NextResponse.json(
      { isValid: true, user: decodedToken },
      { status: 200 }
    );
  } catch (error) {
    console.log("Session verification failed:", error);
    return NextResponse.json({ isValid: false }, { status: 401 });
  }
}
