import { NextRequest, NextResponse } from 'next/server';
import { GrupoController } from '@/app/lib/controllers/grupo';
import { GrupoSchema } from '@/app/lib/schemas/grupo';
import { getAuth } from '@/app/lib/requestAuth';

/**
 * GET /api/grupo
 * Obtiene todos los grupos y memorias
 */
export async function GET(request: NextRequest) {
  try {
    const response = await GrupoController.getAll();

    return NextResponse.json(response, { status: response.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * POST /api/grupo
 * Crea un nuevo grupo (admin only)
 */
export async function POST(request: NextRequest) {
  try {
 

    // validar body con Zod
    const body = await request.json();
    try {
      await GrupoSchema.parseAsync(body);
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.errors || e.message }, { status: 400 });
    }

    const { nombre } = body;

  const response = await GrupoController.create(nombre);

    return NextResponse.json(response, { status: response.success ? 201 : response.error === 'No autorizado' ? 403 : 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error al procesar la solicitud' }, { status: 500 });
  }
}
