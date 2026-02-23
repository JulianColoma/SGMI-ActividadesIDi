import pool from '../db';

export interface IMemoria {
  id?: number;
  grupo_id: number;
  anio: number;
  contenido?: string;
  deleted_at?: Date | null;
}

export class MemoriaModel {
  static encodeCursor(c: { id: number }) {
    return Buffer.from(JSON.stringify(c), "utf8").toString("base64url");
  }

  static decodeCursor(cursor: string): { id: number; anio?: number } {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  }
  
  /**
   * Crear memoria (SOLO si el grupo existe y está activo)
   */
  static async create(data: IMemoria) {
    // Chequear que el grupo esté vivo
    const grupoCheck = await pool.query(
      'SELECT id FROM grupos WHERE id = $1 AND deleted_at IS NULL', 
      [data.grupo_id]
    );

    if (grupoCheck.rows.length === 0) {
      throw new Error('No se puede crear una memoria para un grupo eliminado o inexistente.');
    }

    // Chequear que el grupo NO tenga ya una memoria activa para ese año
    const memoriaCheck = await pool.query(
      'SELECT id FROM memorias WHERE grupo_id = $1 AND anio = $2 AND deleted_at IS NULL',
      [data.grupo_id, data.anio]
    );

    if (memoriaCheck.rows.length > 0) {
      throw new Error(`El grupo ya tiene una memoria activa registrada para el año ${data.anio}.`);
    }

    
    const q = `
      INSERT INTO memorias (grupo_id, anio, contenido) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const r = await pool.query(q, [data.grupo_id, data.anio, data.contenido || null]);
    
    return r.rows[0];
}
  static async findById(id: number) {

    // Buscar la memoria base y verificar que su grupo no este eliminado
  
    const memoriaRes = await pool.query(
      `SELECT m.*, g.nombre AS grupo_nombre 
       FROM memorias m
       JOIN grupos g ON m.grupo_id = g.id AND g.deleted_at IS NULL
       WHERE m.id = $1 AND m.deleted_at IS NULL`, 
      [id]
    );
    
    if (memoriaRes.rows.length === 0) return null;
    const memoria = memoriaRes.rows[0];

    //  Ejecutar consultas de hijos en paralelo
    const [proyectosRes, trabajosRes] = await Promise.all([
     
      // Investigaciones activas
      pool.query(
        `SELECT * FROM investigaciones 
         WHERE memoria_id = $1 
         AND deleted_at IS NULL 
         ORDER BY id DESC`, 
        [id]
      ),

      // Trabajos activos
      pool.query(
        `SELECT tc.*, 
                r.nombre AS reunion, 
                r.ciudad, r.tipo, r.pais,
                p.nombre AS expositor_nombre
         FROM trabajos_congresos tc
         LEFT JOIN reuniones r ON tc.reunion_id = r.id
         LEFT JOIN personal p ON tc.expositor_id = p.id
         WHERE tc.memoria_id = $1 
         AND tc.deleted_at IS NULL
         ORDER BY tc.fecha_presentacion DESC`,
        [id]
      )
    ]);

    return {
      ...memoria,
      proyectos: proyectosRes.rows, 
      trabajos: trabajosRes.rows    
    };
  }

  static async findAllPaginadoByGrupo(opts: { grupoId: number; cursor?: string | null }) {
    const pageSize = 3;
    const take = pageSize + 1;
    const cursor = opts.cursor ?? null;
    const params: any[] = [opts.grupoId];
    let idx = 2;

    let q = `
      SELECT id, anio, grupo_id, contenido
      FROM memorias
      WHERE deleted_at IS NULL
      AND grupo_id = $1
    `;

    if (cursor) {
      const c = this.decodeCursor(cursor);
      if (typeof c?.anio === "number" && typeof c?.id === "number") {
        q += ` AND (anio < $${idx} OR (anio = $${idx} AND id < $${idx + 1}))`;
        params.push(c.anio, c.id);
        idx += 2;
      } else if (typeof c?.id === "number") {
        // Compatibilidad con cursores viejos (solo id)
        q += ` AND id < $${idx++}`;
        params.push(c.id);
      }
    }

    q += ` ORDER BY anio DESC, id DESC LIMIT $${idx}`;
    params.push(take);

    const r = await pool.query(q, params);
    const rows = r.rows;
    const hasMore = rows.length > pageSize;
    const items = hasMore ? rows.slice(0, pageSize) : rows;
    const nextCursor =
      items.length > 0
        ? this.encodeCursor({
            anio: items[items.length - 1].anio,
            id: items[items.length - 1].id,
          })
        : null;

    return { items, hasMore, nextCursor };
  }
  
  // transaccion para borrar una memoria y sus hijos (investigaciones y trabajos)
  static async delete(id: number) { 
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const now = new Date();

      // Borrar hijos
      await client.query(`UPDATE investigaciones SET deleted_at = $1 WHERE memoria_id = $2 AND deleted_at IS NULL`, [now, id]);
      await client.query(`UPDATE trabajos_congresos SET deleted_at = $1 WHERE memoria_id = $2 AND deleted_at IS NULL`, [now, id]);

      // Borrar la Memoria
      const result = await client.query(
        `UPDATE memorias SET deleted_at = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING id`, 
        [now, id]
      );

      await client.query('COMMIT');
      return result.rows.length > 0;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
