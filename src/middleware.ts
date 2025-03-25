import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/verifyToken`,
    {
      method: "GET",
      headers: { Cookie: req.headers.get("cookie") || "" },
    }
  );

  if (res.status === 200) {
    const data = await res.json();
    req.user = data.user;
    return NextResponse.next();
  } else {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/login`);
  }
}

export const config = {
  matcher: ["/"],
};
