import { NextRequest, NextResponse } from "next/server";
import { PersonalModel } from "@/app/lib/models/personal";

export async function GET(request: NextRequest) {
  try {
    const expositores = await PersonalModel.findAll();
    return NextResponse.json({ success: true, data: expositores });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
