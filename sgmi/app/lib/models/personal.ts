import pool from '../db';

export interface IPersonal {
  id?: number;
  nombre: string;
}

export class PersonalModel {
  static async findAll() {
    const q = 'SELECT id, nombre FROM personal ORDER BY nombre ASC';
    const r = await pool.query(q);
    return r.rows;
  }

  static async findById(id: number) {
    const q = 'SELECT id, nombre FROM personal WHERE id = $1 LIMIT 1';
    const r = await pool.query(q, [id]);
    return r.rows.length ? r.rows[0] : null;
  }

  static async findByName(nombre: string) {
    const q = 'SELECT id, nombre FROM personal WHERE LOWER(nombre) = LOWER($1) LIMIT 1';
    const r = await pool.query(q, [nombre]);
    return r.rows.length ? r.rows[0] : null;
  }

  static async create(data: IPersonal) {
    const q = `INSERT INTO personal (nombre) VALUES ($1) RETURNING *`;
    const r = await pool.query(q, [data.nombre]);
    return r.rows[0];
  }
}
