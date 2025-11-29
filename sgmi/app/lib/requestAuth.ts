import { NextRequest } from 'next/server';
import { verifyToken, JwtPayload } from './auth';
import { cookies } from 'next/headers';

export async function getAuth(request: NextRequest): Promise<JwtPayload | null> {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
