import { NextRequest, NextResponse } from 'next/server';
import { MemoriaController } from '@/app/lib/controllers/memoria';
import { createMemoriaSchema } from '@/app/lib/schemas/memoria';
import { getAuth } from '@/app/lib/requestAuth';

export async function GET(request: NextRequest) {
  try {
    const search = new URL(request.url).searchParams;
    const grupoId = search.get('grupo_id') ? parseInt(search.get('grupo_id') as string) : undefined;
    const res = await MemoriaController.getAll(grupoId);
    return NextResponse.json(res, { status: res.success ? 200 : 400 });
  } catch (e: any) { return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
  const auth = getAuth(request);
  const role = auth?.role ?? 'user';
  const userId = auth?.id;
    const body = await request.json();
    try { await createMemoriaSchema.parseAsync(body); } catch (err: any) { return NextResponse.json({ success: false, error: err.errors || err.message }, { status: 400 }); }
    const payload = { ...body, creado_por: userId };
    const res = await MemoriaController.create(role, payload as any);
    return NextResponse.json(res, { status: res.success ? 201 : res.error === 'No autorizado' ? 403 : 400 });
  } catch (e: any) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }); }
}
