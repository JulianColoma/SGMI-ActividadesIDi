import { NextRequest, NextResponse } from 'next/server';
import { TrabajoController } from '@/app/lib/controllers/trabajo';
import { updateTrabajoSchema } from '@/app/lib/schemas/trabajo';
import { getAuth } from '@/app/lib/requestAuth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; const res = await TrabajoController.getById(parseInt(id)); return NextResponse.json(res, { status: res.success ? 200 : 404 }); } catch (e: any) { return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await getAuth(request);
    const role = auth?.role ?? 'user';
    const body = await request.json();
    try {
      await updateTrabajoSchema.parseAsync(body);
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.errors || err.message }, { status: 400 });
    }

    const res = await TrabajoController.update(parseInt(id), role, body);
    return NextResponse.json(res, { status: res.success ? 200 : res.error === 'No autorizado' ? 403 : 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await getAuth(request);
    const role = auth?.role ?? 'user';
    const res = await TrabajoController.delete(parseInt(id), role);
    return NextResponse.json(res, { status: res.success ? 200 : res.error === 'No autorizado' ? 403 : 404 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
