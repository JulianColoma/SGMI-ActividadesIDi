
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) throw new Error("Invalid token");
    return NextResponse.json({ message: "Authorized", user: decoded }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
