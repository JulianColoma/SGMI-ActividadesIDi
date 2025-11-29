import { NextRequest } from 'next/server';
import { verifyToken, JwtPayload } from './auth';

export async function getAuth(request: NextRequest): Promise<JwtPayload | null> {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
