import pool from '../db';

export interface IGrupo {
  id?: number;
  nombre: string;
  memorias?: any[];
  deleted_at?: Date | null;
}

export class GrupoModel {
  static encodeCursor(c: { id: number }) {
    return Buffer.from(JSON.stringify(c), "utf8").toString("base64url");
  }

  static decodeCursor(cursor: string): { id: number } {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  }

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
          ) FILTER (WHERE m.id IS NOT NULL AND m.deleted_at IS NULL), 
          '[]'
        ) as memorias
      FROM grupos g
      LEFT JOIN memorias m ON g.id = m.grupo_id AND m.deleted_at IS NULL
      WHERE g.deleted_at IS NULL  
      GROUP BY g.id, g.nombre
      ORDER BY g.id ASC;
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  static async findAllPaginado(opts?: { cursor?: string | null; q?: string }) {
    const pageSize = 3;
    const take = pageSize + 1;
    const cursor = opts?.cursor ?? null;
    const params: any[] = [];
    let idx = 1;

    let query = `
      SELECT g.id, g.nombre
      FROM grupos g
      WHERE g.deleted_at IS NULL
    `;

    if (opts?.q?.trim()) {
      query += ` AND unaccent(lower(g.nombre)) LIKE unaccent(lower($${idx++}))`;
      params.push(`%${opts.q.trim()}%`);
    }

    if (cursor) {
      const c = this.decodeCursor(cursor);
      query += ` AND g.id > $${idx++}`;
      params.push(c.id);
    }

    query += ` ORDER BY g.id ASC LIMIT $${idx}`;
    params.push(take);

    const r = await pool.query(query, params);
    const rows = r.rows;
    const hasMore = rows.length > pageSize;
    const items = hasMore ? rows.slice(0, pageSize) : rows;
    const nextCursor =
      items.length > 0 ? this.encodeCursor({ id: items[items.length - 1].id }) : null;

    return { items, hasMore, nextCursor };
  }

  /**
   * Obtener un grupo por ID
   */
  static async findById(id: number): Promise<IGrupo | null> {
    const query = 'SELECT * FROM grupos WHERE id = $1 AND deleted_at IS NULL';
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
    // Pedimos un cliente específico del pool para manejar la transacción
    const client = await pool.connect();

    try {
      // 1. Iniciamos la transacción
      await client.query('BEGIN');

      const now = new Date(); // Fecha de borrado unificada

      // ---------------------------------------------------------
      // PASO A: Borrar "Nietos" (Investigaciones y Trabajos)
      // ---------------------------------------------------------
      
      const queryInvestigaciones = `
        UPDATE investigaciones 
        SET deleted_at = $1 
        WHERE memoria_id IN (SELECT id FROM memorias WHERE grupo_id = $2)
        AND deleted_at IS NULL
      `;
      await client.query(queryInvestigaciones, [now, id]);

      const queryTrabajos = `
        UPDATE trabajos_congresos 
        SET deleted_at = $1 
        WHERE memoria_id IN (SELECT id FROM memorias WHERE grupo_id = $2)
        AND deleted_at IS NULL
      `;
      await client.query(queryTrabajos, [now, id]);

      // ---------------------------------------------------------
      // PASO B: Borrar "Hijos" (Memorias)
      // ---------------------------------------------------------
      const queryMemorias = `
        UPDATE memorias 
        SET deleted_at = $1 
        WHERE grupo_id = $2
        AND deleted_at IS NULL
      `;
      await client.query(queryMemorias, [now, id]);

      // ---------------------------------------------------------
      // PASO C: Borrar "Padre" (Grupo)
      // ---------------------------------------------------------
      const queryGrupo = `
        UPDATE grupos 
        SET deleted_at = $1 
        WHERE id = $2 
        AND deleted_at IS NULL
        RETURNING id
      `;
      const result = await client.query(queryGrupo, [now, id]);

      // 2. Si todo salió bien, confirmamos los cambios
      await client.query('COMMIT');

      // Devolvemos true si se borró al menos un grupo
      return result.rows.length > 0;

    } catch (error) {
      // 3. Si algo falló, deshacemos TODO
      await client.query('ROLLBACK');
      console.error('Error en soft delete transaction:', error);
      throw error; // Re-lanzamos el error para que lo maneje el controller
    } finally {
      // 4. Liberamos el cliente devuelta al pool
      client.release();
    }
  }
}
