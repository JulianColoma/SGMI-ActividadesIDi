import { NextRequest, NextResponse } from 'next/server';
import { GrupoController } from '@/app/lib/controllers/grupo';
import { UpdateGrupoInput, UpdateGrupoSchema } from '@/app/lib/schemas/grupo';
import { getAuth } from '@/app/lib/requestAuth';

/*
 * GET /api/grupo/[id]
 * Obtiene un grupo específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const { id } = await params;
  const response = await GrupoController.getById(parseInt(id));

    return NextResponse.json(response, { status: response.success ? 200 : 404 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/grupo/[id]
 * Actualiza un grupo específico
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificación de Seguridad
      const auth = await getAuth(request);

       if (!auth || auth.role !== "admin") {
        return NextResponse.json(
        { success: false, error: "Sólo administradores pueden modificar grupos." },
        { status: 403 }
     );
  }

    const { id } = await params;
    const body = await request.json();
    try {
      await UpdateGrupoSchema.parseAsync(body);
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.errors || e.message }, { status: 400 });
    }

    const response = await GrupoController.update(parseInt(id),  body);

    return NextResponse.json(response, { status: response.success ? 200 : response.error === 'No autorizado' ? 403 : 400 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al procesar la solicitud'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/grupo/[id]
 * Elimina un grupo específico
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificación de Seguridad
      const auth = await getAuth(request);

       if (!auth || auth.role !== "admin") {
        return NextResponse.json(
        { success: false, error: "Sólo administradores pueden eliminar grupos." },
        { status: 403 }
     );
  }
    const { id } = await params;
    const response = await GrupoController.delete(parseInt(id));

    return NextResponse.json(response, { status: response.success ? 200 : response.error === 'No autorizado' ? 403 : 404 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
