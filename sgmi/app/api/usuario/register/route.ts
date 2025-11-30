
import { NextRequest, NextResponse } from "next/server";
import { UsuarioController } from "@/app/lib/controllers/usuario";
import { registerSchema } from "@/app/lib/schemas/usuario";
import { getAuth } from "@/app/lib/requestAuth";

export async function POST(request: NextRequest) {
  try {
    
    // 1 Verificación de Seguridad
      const auth = await getAuth(request);

       if (!auth || auth.role !== "admin") {
        return NextResponse.json(
        { success: false, error: "Sólo administradores pueden registrar usuarios." },
        { status: 403 }
     );
  }

    // 2. Lectura y Validación de Datos
    const body = await request.json();

    try {
      await registerSchema.parseAsync(body);
    } catch (e: any) {
      // Manejo de errores de Zod para React
      let errorMessage = e.message;

      if (e.errors && Array.isArray(e.errors)) {
        errorMessage = e.errors.map((err: any) => err.message).join(". ");
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    // 3. Registro en Base de Datos
    const res = await UsuarioController.register(body);
    return NextResponse.json(res, { status: res.success ? 201 : 400 });

  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

