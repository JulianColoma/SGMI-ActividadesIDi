import { NextRequest, NextResponse } from 'next/server';
import { MemoriaController } from '@/app/lib/controllers/memoria';


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await MemoriaController.getById(parseInt(id));
    return NextResponse.json(res, { status: res.success ? 200 : 400 });
  } catch (e: any) { return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await MemoriaController.delete(parseInt(id));
    return NextResponse.json(res, { status: res.success ? 200 : res.error === 'No autorizado' ? 403 : 404 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}