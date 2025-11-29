import pool from '../db';

export interface ITrabajo {
  id?: number;
  titulo: string;
  resumen?: string;
  expositor_id?: number | null;
  reunion_id?: number | null;
  grupo_id?: number | null;
  fecha_presentacion?: string | null;
  fecha_creacion?: Date;
}

export class TrabajoModel {
  static async create(data: ITrabajo): Promise<ITrabajo> {
    const q = `INSERT INTO trabajos_congresos (titulo, resumen, expositor_id, reunion_id, grupo_id, fecha_presentacion)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const r = await pool.query(q, [data.titulo, data.resumen || null, data.expositor_id || null, data.reunion_id || null, data.grupo_id || null, data.fecha_presentacion || null]);
    return r.rows[0];
  }

  static async findAll(grupoId?: number) {
    // Traer trabajos junto con datos de la reunión (nombre, ciudad, tipo, pais) y expositor
    let q = `SELECT tc.*, r.nombre AS reunion, r.ciudad AS ciudad, r.tipo AS reunion_tipo, r.pais AS pais,
            p.nombre AS expositor_nombre
         FROM trabajos_congresos tc
         LEFT JOIN reuniones r ON tc.reunion_id = r.id
         LEFT JOIN personal p ON tc.expositor_id = p.id`;
    const params: any[] = [];
    if (grupoId) {
      q += ' WHERE tc.grupo_id = $1';
      params.push(grupoId);
    }
    q += ' ORDER BY tc.fecha_creacion DESC';
    const r = await pool.query(q, params);
    return r.rows;
  }

  static async findById(id: number) {
    const r = await pool.query('SELECT * FROM trabajos_congresos WHERE id = $1', [id]);
    return r.rows.length ? r.rows[0] : null;
  }

  static async update(id: number, data: Partial<ITrabajo>) {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (data.titulo !== undefined) { updates.push(`titulo = $${idx++}`); params.push(data.titulo); }
    if (data.resumen !== undefined) { updates.push(`resumen = $${idx++}`); params.push(data.resumen); }
    if (data.expositor_id !== undefined) { updates.push(`expositor_id = $${idx++}`); params.push(data.expositor_id); }
    if (data.reunion_id !== undefined) { updates.push(`reunion_id = $${idx++}`); params.push(data.reunion_id); }
    if (data.grupo_id !== undefined) { updates.push(`grupo_id = $${idx++}`); params.push(data.grupo_id); }
    if (data.fecha_presentacion !== undefined) { updates.push(`fecha_presentacion = $${idx++}`); params.push(data.fecha_presentacion); }
    if (!updates.length) return null;
    params.push(id);
    const q = `UPDATE trabajos_congresos SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
    const r = await pool.query(q, params);
    return r.rows.length ? r.rows[0] : null;
  }

  static async delete(id: number) {
    const r = await pool.query('DELETE FROM trabajos_congresos WHERE id = $1 RETURNING id', [id]);
    return r.rows.length > 0;
  }
}
