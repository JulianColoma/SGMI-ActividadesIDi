import pool from '../db';

export interface IGrupo {
  id?: number;
  nombre: string;
  memorias?: any[];
}

export class GrupoModel {
  /**
   * Crear un nuevo grupo
   */
  static async create(grupo: IGrupo): Promise<IGrupo> {
    const query = `
      INSERT INTO grupos (nombre)
      VALUES ($1)
      RETURNING id, nombre
    `;

    const result = await pool.query(query, [
      grupo.nombre
    ]);

    return result.rows[0];
  }

  /**
   * Obtener todos los grupos con opción de filtro
   */
  /**
   * Obtener todos los grupos con sus memorias anidadas
   */
  static async findAll(): Promise<IGrupo[]> {
    // Usamos JSON_AGG para meter las memorias dentro de un array en el mismo SQL
    const query = `
      SELECT 
        g.id, 
        g.nombre, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', m.id, 
              'anio', m.anio, 
              'contenido', m.contenido
            ) ORDER BY m.anio DESC
          ) FILTER (WHERE m.id IS NOT NULL), 
          '[]'
        ) as memorias
      FROM grupos g
      LEFT JOIN memorias m ON g.id = m.grupo_id
      GROUP BY g.id, g.nombre
      ORDER BY g.id ASC;
    `;

    const result = await pool.query(query);
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
    const params: any[] = [id, grupo.nombre];

    const query = `
      UPDATE grupos
      SET nombre=$2
      WHERE id = $1
      RETURNING id, nombre
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
