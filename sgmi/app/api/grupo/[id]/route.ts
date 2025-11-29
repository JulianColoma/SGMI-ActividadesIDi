import { NextRequest, NextResponse } from 'next/server';
import { GrupoController } from '@/app/lib/controllers/grupo';
import { updateGrupoSchema } from '@/app/lib/schemas/grupo';
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
  const auth = await getAuth(request);
  const role = auth?.role ?? 'user';

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
  const { id } = await params;
  const auth = await getAuth(request);
  const role = auth?.role ?? 'user';

    const body = await request.json();
    try {
      await updateGrupoSchema.parseAsync(body);
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.errors || e.message }, { status: 400 });
    }

    const response = await GrupoController.update(parseInt(id), role, body);

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
  const { id } = await params;
  const auth = await getAuth(request);
  const role = auth?.role ?? 'user';

    const response = await GrupoController.delete(parseInt(id), role);

    return NextResponse.json(response, { status: response.success ? 200 : response.error === 'No autorizado' ? 403 : 404 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
