import pool from '../db';

export interface IGrupo {
  id?: number;
  nombre: string;
  descripcion?: string;
  facultad_id?: number | null;
  fecha_creacion?: Date;
  estado?: boolean;
}

export class GrupoModel {
  /**
   * Crear un nuevo grupo
   */
  static async create(grupo: IGrupo): Promise<IGrupo> {
    const query = `
      INSERT INTO grupos (nombre, descripcion, facultad_id, estado)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, descripcion, facultad_id, fecha_creacion, estado
    `;

    const result = await pool.query(query, [
      grupo.nombre,
      grupo.descripcion || null,
      grupo.facultad_id || null,
      grupo.estado !== false
    ]);

    return result.rows[0];
  }

  /**
   * Obtener todos los grupos con opción de filtro
   */
  static async findAll(facultadId?: number): Promise<IGrupo[]> {
    let query = 'SELECT * FROM grupos';
    const params: any[] = [];

    if (facultadId) {
      query += ' WHERE facultad_id = $1';
      params.push(facultadId);
    }

    query += ' ORDER BY fecha_creacion DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Obtener un grupo por ID
   */
  static async findById(id: number): Promise<IGrupo | null> {
    const query = 'SELECT * FROM grupos WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Actualizar un grupo
   */
  static async update(id: number, grupo: Partial<IGrupo>): Promise<IGrupo | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (grupo.nombre !== undefined) {
      updates.push(`nombre = $${paramCount++}`);
      params.push(grupo.nombre);
    }

    if (grupo.descripcion !== undefined) {
      updates.push(`descripcion = $${paramCount++}`);
      params.push(grupo.descripcion);
    }

    if (grupo.estado !== undefined) {
      updates.push(`estado = $${paramCount++}`);
      params.push(grupo.estado);
    }

    if (updates.length === 0) return null;

    params.push(id);
    const query = `
      UPDATE grupos
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, nombre, descripcion, facultad_id, fecha_creacion, estado
    `;

    const result = await pool.query(query, params);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Eliminar un grupo
   */
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM grupos WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);

    return result.rows.length > 0;
  }
}
