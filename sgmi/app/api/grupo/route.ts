import { NextRequest, NextResponse } from 'next/server';
import { GrupoController } from '@/app/lib/controllers/grupo';
import { createGrupoSchema } from '@/app/lib/schemas/grupo';

/**
 * GET /api/grupo
 * Obtiene todos los grupos (opcional filtro por facultad)
 */
export async function GET(request: NextRequest) {
  try {
    const search = new URL(request.url).searchParams;
    const facultadId = search.get('facultad_id') ? parseInt(search.get('facultad_id') as string) : undefined;

    const response = await GrupoController.getAll(facultadId);

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
    const role = (request.headers.get('x-user-role') || 'user').toString();

    // validar body con Zod
    const body = await request.json();
    try {
      await createGrupoSchema.parseAsync(body);
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.errors || e.message }, { status: 400 });
    }

    const { nombre, descripcion, facultad_id } = body;

    const response = await GrupoController.create(nombre, role, descripcion, facultad_id);

    return NextResponse.json(response, { status: response.success ? 201 : response.error === 'No autorizado' ? 403 : 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Error al procesar la solicitud' }, { status: 500 });
  }
}
