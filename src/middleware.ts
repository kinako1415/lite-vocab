import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const isLoggedIn = session;

  if (!isLoggedIn) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/login`);
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
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/login`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
