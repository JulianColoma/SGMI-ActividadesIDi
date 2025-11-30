import { NextRequest, NextResponse } from "next/server";
import { UsuarioController } from "@/app/lib/controllers/usuario";
import { loginSchema } from "@/app/lib/schemas/usuario";
import { serialize } from "cookie";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    try {
      await loginSchema.parseAsync(body);
    } catch (e: any) {
      return NextResponse.json(
        { success: false, error: e.errors || e.message },
        { status: 400 }
      );
    }
    const res = await UsuarioController.login(body.email, body.password);
    if (!res.success || !res.token) {
      return NextResponse.json(res, { status: 401 });
    }
    const cookie = serialize("token", res.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    const response = NextResponse.json({ success: true, data: res.data });
    response.headers.set("Set-Cookie", cookie);
    return response;
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
