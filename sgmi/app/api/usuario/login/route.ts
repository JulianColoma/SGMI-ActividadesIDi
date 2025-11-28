import { NextRequest, NextResponse } from "next/server";
import { UsuarioController } from "@/app/lib/controllers/usuario";
import { loginSchema, registerSchema } from "@/app/lib/schemas/usuario";


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
    return NextResponse.json(res, { status: res.success ? 200 : 401 });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
