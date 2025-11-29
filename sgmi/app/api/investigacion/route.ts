import { NextRequest, NextResponse } from 'next/server';
import { InvestigacionController } from '@/app/lib/controllers/investigacion';
import { createInvestigacionSchema } from '@/app/lib/schemas/investigacion';
import { getAuth } from '@/app/lib/requestAuth';

export async function GET(request: NextRequest) {
  try {
    const search = new URL(request.url).searchParams;
    const grupoId = search.get('grupo_id') ? parseInt(search.get('grupo_id') as string) : undefined;
    const res = await InvestigacionController.getAll(grupoId);
    return NextResponse.json(res, { status: res.success ? 200 : 400 });
  } catch (e: any) { return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
  const auth = await getAuth(request);
  const role = auth?.role ?? 'user';
    const body = await request.json();
    try { await createInvestigacionSchema.parseAsync(body); } catch (err: any) { return NextResponse.json({ success: false, error: err.errors || err.message }, { status: 400 }); }
    const res = await InvestigacionController.create(role, body);
    return NextResponse.json(res, { status: res.success ? 201 : res.error === 'No autorizado' ? 403 : 400 });
  } catch (e: any) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }); }
}
