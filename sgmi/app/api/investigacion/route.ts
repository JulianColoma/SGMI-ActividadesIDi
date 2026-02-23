import { NextRequest, NextResponse } from 'next/server';
import { InvestigacionController } from '@/app/lib/controllers/investigacion';
import { createInvestigacionSchema } from '@/app/lib/schemas/investigacion';
import { getAuth } from '@/app/lib/requestAuth';

export async function GET(request: NextRequest) {
  try {
    const sp= request.nextUrl.searchParams;
    const memoriaId = sp.has('memoriaId') ? Number(sp.get('memoriaId')) : undefined;
    const cursor = sp.get('cursor');
    const q = sp.get('q') ?? undefined;
    const res = await InvestigacionController.getAll({ cursor, memoriaId, q });
    return NextResponse.json(res, { status: res.success ? 200 : 400 });
  } catch (e: any) { return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    // Verificación de Seguridad
      const auth = await getAuth(request);

       if (!auth || auth.role !== "admin") {
        return NextResponse.json(
        { success: false, error: "Sólo administradores pueden crear proyectos." },
        { status: 403 }
     );
  }
    const body = await request.json();
    try { await createInvestigacionSchema.parseAsync(body); } catch (err: any) { return NextResponse.json({ success: false, error: err.errors || err.message }, { status: 400 }); }
    const res = await InvestigacionController.create( body);
    return NextResponse.json(res, { status: res.success ? 201 : res.error === 'No autorizado' ? 403 : 400 });
  } catch (e: any) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }); }
}
