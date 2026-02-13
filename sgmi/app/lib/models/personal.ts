import pool from '../db';

export interface IPersonal {
  id?: number;
  nombre: string;
  deleted_at?: Date | null;
}

export class PersonalModel {
  
  static async findAll() {
    const q = 'SELECT id, nombre FROM personal WHERE deleted_at IS NULL ORDER BY nombre ASC';
    const r = await pool.query(q);
    return r.rows;
  }

  static async findById(id: number) {
    const q = 'SELECT id, nombre FROM personal WHERE id = $1 AND deleted_at IS NULL LIMIT 1';
    const r = await pool.query(q, [id]);
    return r.rows.length ? r.rows[0] : null;
  }

  static async findByName(nombre: string) {
    const q = 'SELECT id, nombre FROM personal WHERE LOWER(nombre) = LOWER($1) AND deleted_at IS NULL LIMIT 1';
    const r = await pool.query(q, [nombre]);
    return r.rows.length ? r.rows[0] : null;
  }

  static async create(data: IPersonal) {
    const q = `INSERT INTO personal (nombre) VALUES ($1) RETURNING *`;
    const r = await pool.query(q, [data.nombre]);
    return r.rows[0];
  }



  static async delete(id: number) {
    // Acá NO borramos en cascada.
    // Si Juan presentó un trabajo en 2023, queremos que en el reporte de 2023 siga saliendo Juan,
    // aunque hoy Juan esté borrado de forma logica del sistema actual.
    const q = `
        UPDATE personal 
        SET deleted_at = NOW() 
        WHERE id = $1 AND deleted_at IS NULL 
        RETURNING id`;
    const r = await pool.query(q, [id]);
    return r.rows.length > 0;
  }
}