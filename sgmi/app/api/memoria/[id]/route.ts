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


