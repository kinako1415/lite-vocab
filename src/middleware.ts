import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const isLoggedIn = session;

  if (!isLoggedIn) {
    if (
      req.nextUrl.pathname === "/signIn" ||
      req.nextUrl.pathname === "/signUp"
    ) {
      return;
    }
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/signIn`);
  }

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
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/signIn`);
  }

  if (
    req.nextUrl.pathname === "/signIn" ||
    req.nextUrl.pathname === "/signUp"
  ) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signIn", "/signUp"],
};
