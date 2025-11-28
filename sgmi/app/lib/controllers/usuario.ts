import pool from '../db';
import bcrypt from 'bcrypt';
import { RegisterInput } from '../schemas/usuario';
import { signToken } from '../auth';

export class UsuarioController {
  static async register(payload: RegisterInput) {
    try {
      const hashed = await bcrypt.hash(payload.password, 10);
      const q = 'INSERT INTO usuarios (nombre, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, nombre, email, role';
      const r = await pool.query(q, [payload.nombre, payload.email, hashed, payload.role || 'user']);
      return { success: true, data: r.rows[0] };
    } catch (e: any) { return { success: false, error: e.message } }
  }

  static async login(email: string, password: string) {
    try {
      const q = 'SELECT id, nombre, email, password, role FROM usuarios WHERE email = $1 LIMIT 1';
      const r = await pool.query(q, [email]);
      if (!r.rows.length) return { success: false, error: 'Credenciales invalidas' };
      const user = r.rows[0];
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return { success: false, error: 'Credenciales invalidas' };

      const token = signToken({ id: user.id, email: user.email, role: user.role, nombre: user.nombre });

      return { success: true, data: { id: user.id, nombre: user.nombre, email: user.email, role: user.role, token } };
    } catch (e: any) { return { success: false, error: e.message } }
  }
}
 