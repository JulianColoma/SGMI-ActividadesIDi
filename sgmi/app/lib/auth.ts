import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: number;
  role: string;
  email: string;
  nombre: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (e) {
    return null;
  }
}
