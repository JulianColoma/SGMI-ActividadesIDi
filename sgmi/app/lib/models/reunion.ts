import pool from '../db';

export interface IReunion {
  id?: number;
  tipo?: string; // 'NACIONAL' | 'INTERNACIONAL'
  nombre: string;
  ciudad?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  pais?: string | null;
  deleted_at?: Date | null;
}

export class ReunionModel {
  

  static async findAll() {
    const q = 'SELECT * FROM reuniones WHERE deleted_at IS NULL ORDER BY fecha_inicio DESC';
    const r = await pool.query(q);
    return r.rows;
  }

  static async findById(id: number) {
    const q = 'SELECT * FROM reuniones WHERE id = $1 AND deleted_at IS NULL';
    const r = await pool.query(q, [id]);
    return r.rows.length ? r.rows[0] : null;
  }

 
  static async findByNameCity(nombre: string, ciudad?: string | null) {
    const q = `
      SELECT * FROM reuniones 
      WHERE nombre = $1 
      AND (ciudad = $2 OR ($2 IS NULL AND ciudad IS NULL)) 
      AND deleted_at IS NULL 
      LIMIT 1`;
      
    const r = await pool.query(q, [nombre, ciudad || null]);
    return r.rows.length ? r.rows[0] : null;
  }

  static async create(data: IReunion) {
    const q = `
      INSERT INTO reuniones (tipo, nombre, ciudad, fecha_inicio, fecha_fin, pais)
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`;
      
    const params = [
      data.tipo || null, 
      data.nombre, 
      data.ciudad || null, 
      data.fecha_inicio || null, 
      data.fecha_fin || null, 
      data.pais || null
    ];
    
    const r = await pool.query(q, params);
    return r.rows[0];
  }

  static async update(id: number, data: Partial<IReunion>) {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (data.tipo !== undefined) { fields.push(`tipo = $${idx++}`); params.push(data.tipo); }
    if (data.nombre !== undefined) { fields.push(`nombre = $${idx++}`); params.push(data.nombre); }
    if (data.ciudad !== undefined) { fields.push(`ciudad = $${idx++}`); params.push(data.ciudad); }
    if (data.fecha_inicio !== undefined) { fields.push(`fecha_inicio = $${idx++}`); params.push(data.fecha_inicio); }
    if (data.fecha_fin !== undefined) { fields.push(`fecha_fin = $${idx++}`); params.push(data.fecha_fin); }
    if (data.pais !== undefined) { fields.push(`pais = $${idx++}`); params.push(data.pais); }

    if (fields.length === 0) return null;

    params.push(id);

    // Solo permitimos editar si NO está borrada
    const q = `
      UPDATE reuniones 
      SET ${fields.join(', ')} 
      WHERE id = $${idx} AND deleted_at IS NULL 
      RETURNING *`;
      
    const r = await pool.query(q, params);
    return r.rows.length ? r.rows[0] : null;
  }

  // borrado logico simple (Solo marca la reunión, no toca los trabajos)
  static async delete(id: number) {
    const q = `
      UPDATE reuniones 
      SET deleted_at = NOW() 
      WHERE id = $1 AND deleted_at IS NULL 
      RETURNING id`;
      
    const r = await pool.query(q, [id]);
    return r.rows.length > 0;
  }
}