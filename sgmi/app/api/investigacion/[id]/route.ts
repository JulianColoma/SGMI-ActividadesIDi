import { NextRequest, NextResponse } from 'next/server';
import { InvestigacionController } from '@/app/lib/controllers/investigacion';
import { updateInvestigacionSchema } from '@/app/lib/schemas/investigacion';
import { getAuth } from '@/app/lib/requestAuth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; const res = await InvestigacionController.getById(parseInt(id)); return NextResponse.json(res, { status: res.success ? 200 : 404 }); } catch (e: any) { return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await getAuth(request);
    const role = auth?.role ?? 'user';
    const body = await request.json();
    try {
      await updateInvestigacionSchema.parseAsync(body);
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.errors || err.message }, { status: 400 });
    }

    const res = await InvestigacionController.update(parseInt(id), role, body);
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
    const res = await InvestigacionController.delete(parseInt(id), role);
    return NextResponse.json(res, { status: res.success ? 200 : res.error === 'No autorizado' ? 403 : 404 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
