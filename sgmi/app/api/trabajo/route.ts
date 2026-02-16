import { NextRequest, NextResponse } from 'next/server';
import { TrabajoController } from '@/app/lib/controllers/trabajo';
import { createTrabajoSchema } from '@/app/lib/schemas/trabajo';
import { getAuth } from '@/app/lib/requestAuth';


export async function GET(request: NextRequest) {
  try {
    const sp= request.nextUrl.searchParams;
    const grupoId = sp.has('grupoId') ? Number(sp.get('grupoId')) : undefined;
    const cursor = sp.get('cursor');


    const res = await TrabajoController.getAll({grupoId, cursor});
    return NextResponse.json(res, { status: res.success ? 200 : 400 });
  } catch (e: any) { return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    // Verificación de Seguridad
          const auth = await getAuth(request);
    
           if (!auth || auth.role !== "admin") {
            return NextResponse.json(
            { success: false, error: "Sólo administradores pueden crear trabajos." },
            { status: 403 }
         );
      }
    const body = await request.json();
    try { 
      await createTrabajoSchema.parseAsync(body); 
    } catch (err: any) { 
      const errorMessage = err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message || 'Validación fallida';
      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 }); 
    }
    const res = await TrabajoController.create(body);
    return NextResponse.json(res, { status: res.success ? 201 : res.error === 'No autorizado' ? 403 : 400 });
  } catch (e: any) { return NextResponse.json({ success: false, error: e.message }, { status: 500 }); }
}
