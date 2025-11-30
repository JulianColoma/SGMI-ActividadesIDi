import pool from '../db';

export interface IMemoria {
  id?: number;
  grupo_id: number;
  anio: number;
  contenido?: string;
  creado_por?: number | null;
  fecha_creacion?: Date;
}

export class MemoriaModel {
  static async create(data: IMemoria) {
    const q = `INSERT INTO memorias (grupo_id, anio, contenido) VALUES ($1, $2, $3) RETURNING *`;
    const r = await pool.query(q, [data.grupo_id, data.anio, data.contenido || null]);
    return r.rows[0];
  }

  static async findAll(grupoId?: number) {
    let q = 'SELECT * FROM memorias';
    const params: any[] = [];
    if (grupoId) { q += ' WHERE grupo_id = $1'; params.push(grupoId); }
    q += ' ORDER BY fecha_creacion DESC';
    const r = await pool.query(q, params);
    return r.rows;
  }

  static async findById(id: number) { const r = await pool.query('SELECT * FROM memorias WHERE id = $1', [id]); return r.rows.length ? r.rows[0] : null }

  static async update(id: number, data: Partial<IMemoria>) {
    const updates: string[] = []; const params: any[] = []; let idx = 1;
    if (data.anio !== undefined) { updates.push(`anio = $${idx++}`); params.push(data.anio); }
    if (data.contenido !== undefined) { updates.push(`contenido = $${idx++}`); params.push(data.contenido); }
    if (!updates.length) return null; params.push(id);
    const q = `UPDATE memorias SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
    const r = await pool.query(q, params); return r.rows.length ? r.rows[0] : null;
  }

  static async delete(id: number) { const r = await pool.query('DELETE FROM memorias WHERE id = $1 RETURNING id', [id]); return r.rows.length > 0 }
}
