import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const session = req.headers
      .get("Cookie")
      ?.split("session=")[1]
      ?.split(";")[0];

    if (!session) {
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    // まず、revoke チェックなしでセッションを検証
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifySessionCookie(session, false);
    } catch (verifyError) {
      console.log("セッション検証エラー:", verifyError);
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    if (!decodedToken) {
      return NextResponse.json({ isValid: false }, { status: 403 });
    }

    // セッションが有効期限に近い場合（残り1日以下）、フロントエンドに更新を促すフラグを返す
    const now = Math.floor(Date.now() / 1000);
    const expirationTime = decodedToken.exp;
    const timeUntilExpiry = expirationTime - now;
    const oneDayInSeconds = 24 * 60 * 60;

    let shouldRefresh = false;
    if (timeUntilExpiry < oneDayInSeconds) {
      shouldRefresh = true;
    }

    return NextResponse.json(
      {
        isValid: true,
        user: decodedToken,
        shouldRefresh,
        expiresAt: expirationTime,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Session verification failed:", error);
    return NextResponse.json({ isValid: false }, { status: 401 });
  }
}
