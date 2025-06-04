import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const isLoggedIn = session;

  // 認証が不要なページ
  const publicPages = ["/signin", "/signup"];
  const isPublicPage = publicPages.includes(req.nextUrl.pathname);

  if (!isLoggedIn) {
    if (isPublicPage) {
      return NextResponse.next();
    }
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/signin`);
  }

  // セッションが存在する場合、検証を行う
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/verify`,
      {
        method: "GET",
        headers: {
          Cookie: `session=${session}`,
        },
      }
    );

    if (!response.ok) {
      // セッションが無効な場合
      if (isPublicPage) {
        return NextResponse.next();
      }
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/signin`);
    }

    // 認証済みユーザーが認証ページにアクセスした場合、ホームにリダイレクト
    if (isPublicPage) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/`);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("ミドルウェアでのセッション検証エラー:", error);

    // エラーが発生した場合の処理
    if (isPublicPage) {
      return NextResponse.next();
    }
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/signin`);
  }
}

export const config = {
  matcher: ["/", "/signin", "/signup"],
};
