import pool from "../db";

export interface IInvestigacion {
  id?: number;
  tipo: string;
  codigo?: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  nombre: string;
  descripcion?: string;
  logros?: string | null;
  dificultades?: string | null;
  fuente_financiamiento?: string;
  memoria_id: number;
  fecha_creacion?: Date;
  deleted_at?: Date | null;
}

export class InvestigacionModel {
  static async create(data: IInvestigacion): Promise<IInvestigacion> {
    const query = `
      INSERT INTO investigaciones (tipo, codigo, fecha_inicio, fecha_fin, nombre, descripcion, logros, dificultades, fuente_financiamiento, memoria_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await pool.query(query, [
      data.tipo,
      data.codigo || null,
      data.fecha_inicio,
      data.fecha_fin || null,
      data.nombre,
      data.descripcion || null,
      data.logros || null,
      data.dificultades || null,
      data.fuente_financiamiento || null,
      data.memoria_id,
    ]);

    return result.rows[0];
  }

  static encodeCursor(c: { id: number }) {
    return Buffer.from(JSON.stringify(c), "utf8").toString("base64url");
  }

  static decodeCursor(cursor: string): { id: number } | null {
    try {
      return JSON.parse(
        Buffer.from(cursor, "base64url").toString("utf8")
      );
    } catch {
      return null;
    }
  }

  static async findAllPaginado(cursor?: string | null) {
    const LIMIT = 10;
    const lastId = cursor ? this.decodeCursor(cursor) : null;

    let q = `
      SELECT i.*,
             m.anio AS memoria_anio,
             g.nombre AS grupo_nombre
      FROM investigaciones i
      JOIN memorias m ON i.memoria_id = m.id AND m.deleted_at IS NULL
      JOIN grupos g ON m.grupo_id = g.id AND g.deleted_at IS NULL
      WHERE i.deleted_at IS NULL
    `;

    const params: any[] = [];

    if (lastId !== null) {
      params.push(lastId.id);
      q += ` AND i.id > $${params.length} `;
    }

    // Pedir LIMIT + 1 para saber si hay más registros
    params.push(LIMIT + 1);

    q += `
      ORDER BY i.id ASC
      LIMIT $${params.length}
    `;

    const result = await pool.query(q, params);
    const rows = result.rows;

    // Si obtuvimos más de LIMIT, hay más página
    const hasMore = rows.length > LIMIT;
    
    // Devolver solo LIMIT registros
    const dataRows = rows.slice(0, LIMIT);
    
    const nextCursor =
      hasMore && dataRows.length > 0
        ? this.encodeCursor({ id: dataRows[dataRows.length - 1].id })
        : null;

    return {
      data: dataRows,
      pageInfo: {
        nextCursor,
        hasNextPage: hasMore,
      },
    };
  }


  /* static async findAll() {
  
   let q = `
      SELECT i.*, 
             m.anio AS memoria_anio,
             g.nombre AS grupo_nombre
      FROM investigaciones i
      JOIN memorias m ON i.memoria_id = m.id AND m.deleted_at IS NULL
      JOIN grupos g ON m.grupo_id = g.id AND g.deleted_at IS NULL
      WHERE i.deleted_at IS NULL
      ORDER BY i.id ASC`; 
    
    const result = await pool.query(q);
    return result.rows;
  }*/

  static async findById(id: number): Promise<IInvestigacion | null> {
    const q = "SELECT * FROM investigaciones WHERE id = $1 AND deleted_at IS NULL";
    const r = await pool.query(q, [id]);
    return r.rows.length ? r.rows[0] : null;
  }

  static async update(
    id: number,
    data: Partial<IInvestigacion>
  ): Promise<IInvestigacion | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (data.tipo !== undefined) {
      updates.push(`tipo = $${idx++}`);
      params.push(data.tipo);
    }
    if (data.codigo !== undefined) {
      updates.push(`codigo = $${idx++}`);
      params.push(data.codigo);
    }
    if (data.fecha_inicio !== undefined) {
      updates.push(`fecha_inicio = $${idx++}`);
      params.push(data.fecha_inicio);
    }
    if (data.fecha_fin !== undefined) {
      updates.push(`fecha_fin = $${idx++}`);
      params.push(data.fecha_fin);
    }
    if (data.nombre !== undefined) {
      updates.push(`nombre = $${idx++}`);
      params.push(data.nombre);
    }
    if (data.descripcion !== undefined) {
      updates.push(`descripcion = $${idx++}`);
      params.push(data.descripcion);
    }
    if (data.logros !== undefined) {
      updates.push(`logros = $${idx++}`);
      params.push(data.logros);
    }
    if (data.dificultades !== undefined) {
      updates.push(`dificultades = $${idx++}`);
      params.push(data.dificultades);
    }
    if (data.fuente_financiamiento !== undefined) {
      updates.push(`fuente_financiamiento = $${idx++}`);
      params.push(data.fuente_financiamiento);
    }
    if (data.memoria_id !== undefined) {
      updates.push(`memoria_id = $${idx++}`);
      params.push(data.memoria_id);
    }

    if (!updates.length) return null;
    params.push(id);
    const q = `UPDATE investigaciones SET ${updates.join(
      ", "
    )} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`;
    const r = await pool.query(q, params);
    return r.rows.length ? r.rows[0] : null;
  }

  static async delete(id: number): Promise<boolean> {
    const q = `
      UPDATE investigaciones 
      SET deleted_at = NOW() 
      WHERE id = $1 AND deleted_at IS NULL 
      RETURNING id
    `;
    const r = await pool.query(q, [id]);
    return r.rows.length > 0;
  }
}
