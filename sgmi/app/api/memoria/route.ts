import { NextRequest, NextResponse } from 'next/server';
import { MemoriaController } from '@/app/lib/controllers/memoria';
import { createMemoriaSchema } from '@/app/lib/schemas/memoria';
import { getAuth } from '@/app/lib/requestAuth';



export async function POST(request: NextRequest) {
  try {
    // Verificación de Seguridad
      const auth = await getAuth(request);

       if (!auth || auth.role !== "admin") {
        return NextResponse.json(
        { success: false, error: "Sólo administradores pueden crear memorias." },
        { status: 403 }
     );
  }
    const body = await request.json();
    try { await createMemoriaSchema.parseAsync(body); } catch (err: any) { return NextResponse.json({ success: false, error: err.errors || err.message }, { status: 400 }); }
    const payload = { ...body};
    const res = await MemoriaController.create(payload as any);
    return NextResponse.json(res, { status: res.success ? 201 : res.error === 'No autorizado' ? 403 : 400 });
  } catch (e: any) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }); }
}