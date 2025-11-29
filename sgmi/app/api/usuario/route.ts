
import { NextRequest, NextResponse } from "next/server";
import { UsuarioController } from "@/app/lib/controllers/usuario";
import { getAuth } from "@/app/lib/requestAuth";

// Manejador para peticiones GET (Obtener todos los usuarios)
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request);
        
        if (!auth || auth.role !== "admin") {
          return NextResponse.json(
            { success: false, error: "Sólo administradores pueden consultar usuarios." },
            { status: 403 }
          );
        }
    const res = await UsuarioController.getAll();

    if (!res.success) {
      // Si el controlador devuelve un error, lo pasamos a la respuesta.
      return NextResponse.json({ success: false, error: res.error }, { status: 500 });
    }

    // Si todo va bien, devolvemos los datos.
    return NextResponse.json(res);

  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
