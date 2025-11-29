import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // El secret debe ser el mismo que usaste para firmar el token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("La clave secreta JWT no está configurada en las variables de entorno");
    }
    
    jwt.verify(token.value, secret);
    
    return NextResponse.json({ message: "Authorized" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
