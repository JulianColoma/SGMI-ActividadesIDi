import pool from '../db';

export interface IMemoria {
  id?: number;
  grupo_id: number;
  anio: number;
  contenido?: string;
}

export class MemoriaModel {
  static async create(data: IMemoria) {
    const q = `INSERT INTO memorias (grupo_id, anio, contenido) VALUES ($1, $2, $3) RETURNING *`;
    const r = await pool.query(q, [data.grupo_id, data.anio, data.contenido || null]);
    return r.rows[0];
  }


  static async findById(id: number) { const r = await pool.query('SELECT * FROM memorias WHERE id = $1', [id]); return r.rows.length ? r.rows[0] : null }



  static async delete(id: number) { const r = await pool.query('DELETE FROM memorias WHERE id = $1 RETURNING id', [id]); return r.rows.length > 0 }
}
