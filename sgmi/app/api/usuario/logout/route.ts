import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/"
    });

    return response;
  } catch (e) {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
