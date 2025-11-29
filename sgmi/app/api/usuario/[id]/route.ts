import { NextRequest, NextResponse } from "next/server";
import { UsuarioController } from "@/app/lib/controllers/usuario";
import { getAuth } from "@/app/lib/requestAuth";

// Definimos el tipo correcto para Next.js 15
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams // Desestructuramos y tipamos correctamente
) {
  try {
    const auth = await getAuth(request);

    if (!auth || auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Sólo administradores pueden eliminar usuarios." },
        { status: 403 }
      );
    }

    // 1. AWAIT CRÍTICO: Esperamos a que la promesa de params se resuelva
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id, 10);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "El ID de usuario debe ser un número." },
        { status: 400 }
      );
    }

    const res = await UsuarioController.delete(userId);

    if (!res.success && res.error === "Usuario no encontrado") {
      return NextResponse.json(res, { status: 404 });
    }

    if (!res.success) {
      return NextResponse.json(res, { status: 500 });
    }

    return NextResponse.json(res);

  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}