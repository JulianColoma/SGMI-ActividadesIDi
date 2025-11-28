import { NextRequest, NextResponse } from "next/server";
import { UsuarioController } from "@/app/lib/controllers/usuario";
import { registerSchema } from "@/app/lib/schemas/usuario";
import { verifyToken } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Sólo administradores pueden registrar usuarios",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    try {
      await registerSchema.parseAsync(body);
    } catch (e: any) {
      return NextResponse.json(
        { success: false, error: e.errors || e.message },
        { status: 400 }
      );
    }
    const res = await UsuarioController.register(body);
    return NextResponse.json(res, { status: res.success ? 201 : 400 });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
