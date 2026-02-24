import pool from '../db';

export interface ITrabajo {
  id?: number;
  titulo: string;
  resumen?: string;
  expositor_id?: number | null;
  reunion_id?: number | null;
  memoria_id?: number | null;
  fecha_presentacion?: string | null;
  fecha_creacion?: Date;
  deleted_at?: Date | null;
}

export class TrabajoModel {

  static async create(data: ITrabajo): Promise<ITrabajo> {
    // No permitir crear trabajos en memorias borradas
    const checkMemoria = await pool.query(
      'SELECT id FROM memorias WHERE id = $1 AND deleted_at IS NULL',
      [data.memoria_id]
    );

    if (checkMemoria.rows.length === 0) {
      throw new Error("No se puede asignar un trabajo a una memoria eliminada o inexistente.");
    }


    const q = `
      INSERT INTO trabajos_congresos (
        titulo, resumen, expositor_id, reunion_id, memoria_id, fecha_presentacion
      )
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    const r = await pool.query(q, [
      data.titulo,
      data.resumen || null,
      data.expositor_id || null,
      data.reunion_id || null,
      data.memoria_id || null,
      data.fecha_presentacion || null
    ]);
    return r.rows[0];
  }

  static encodeCursor(c: { id: number }) {
    return Buffer.from(JSON.stringify(c), "utf8").toString("base64url");
  }

  static decodeCursor(cursor: string): { id: number } {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  }

  static async findAllpaginado(opts?: {
    grupoId?: number;
    memoriaId?: number;
    cursor?: string | null;
    q?: string;
    reunionTipo?: "NACIONAL" | "INTERNACIONAL";
  }) {
    const pageSize = 2;
    const take = pageSize + 1; // 11
    const cursor = opts?.cursor ?? null;
    let params: any[] = [];
    let idx = 1;
    let q = `
    SELECT tc.*, 
           r.nombre AS reunion, 
           r.ciudad AS ciudad, 
           r.tipo AS reunion_tipo, 
           r.pais AS pais,
           p.nombre AS expositor_nombre,
           m.anio AS memoria_anio,
           g.nombre AS grupo_nombre
    FROM trabajos_congresos tc
    JOIN memorias m ON tc.memoria_id = m.id AND m.deleted_at IS NULL
    JOIN grupos g ON m.grupo_id = g.id AND g.deleted_at IS NULL
    LEFT JOIN reuniones r ON tc.reunion_id = r.id
    LEFT JOIN personal p ON tc.expositor_id = p.id
    WHERE tc.deleted_at IS NULL
  `;

    if (opts?.grupoId) {
      q += ` AND g.id = $${idx++}`;
      params.push(opts.grupoId);
    }
    if (opts?.memoriaId) {
      q += ` AND tc.memoria_id = $${idx++}`;
      params.push(opts.memoriaId);
    }
    if (opts?.q?.trim()) {
      q += ` AND (
        tc.titulo ILIKE $${idx}
        OR COALESCE(r.nombre, '') ILIKE $${idx}
        OR COALESCE(p.nombre, '') ILIKE $${idx}
        OR COALESCE(r.ciudad, '') ILIKE $${idx}
        OR COALESCE(r.pais, '') ILIKE $${idx}
      )`;
      params.push(`%${opts.q.trim()}%`);
      idx++;
    }
    if (opts?.reunionTipo) {
      q += ` AND UPPER(COALESCE(r.tipo, 'NACIONAL')) = $${idx++}`;
      params.push(opts.reunionTipo);
    }
    if (cursor) {
      const c = this.decodeCursor(cursor);
      q += ` AND tc.id < $${idx++}`;
      params.push(c.id);
    }
    q += ` ORDER BY tc.id DESC LIMIT $${idx}`;
    params.push(take);

    const r = await pool.query(q, params);
    const rows = r.rows;

    const hasMore = rows.length > pageSize;
    const items = hasMore ? rows.slice(0, pageSize) : rows;

    const nextCursor =
      items.length > 0 ? this.encodeCursor({ id: items[items.length - 1].id }) : null;

    return { items, hasMore, nextCursor };
  }




  static async findAll() {
  // LÓGICA DE FILTRADO MIXTA:
  // - TC (Trabajo): Debe estar vivo (deleted_at IS NULL).
  // - M (Memoria - Padre): Debe estar viva.
  // - G (Grupo - Abuelo): Debe estar vivo.
  // - R (Reunión) y P (Personal): NO filtramos por deleted_at. 
  //   Si borraste al profesor "Juan", igual querés que salga que él presentó el trabajo en 2023.

  let q = `
      SELECT tc.*, 
             r.nombre AS reunion, 
             r.ciudad AS ciudad, 
             r.tipo AS reunion_tipo, 
             r.pais AS pais,
             p.nombre AS expositor_nombre,
             m.anio AS memoria_anio,
             g.nombre AS grupo_nombre
      FROM trabajos_congresos tc
      -- Joins Estructurales (Padres): Deben estar vivos
      JOIN memorias m ON tc.memoria_id = m.id AND m.deleted_at IS NULL
      JOIN grupos g ON m.grupo_id = g.id AND g.deleted_at IS NULL
      -- Joins Informativos (Asociaciones): Traemos aunque estén borrados (histórico)
      LEFT JOIN reuniones r ON tc.reunion_id = r.id
      LEFT JOIN personal p ON tc.expositor_id = p.id
      WHERE tc.deleted_at IS NULL
      ORDER BY tc.fecha_presentacion DESC`;

  const r = await pool.query(q);
  return r.rows;
}

  static async findById(id: number) {
    // Solo traemos si el trabajo no está borrado y enriquecemos con JOINs
    const q = `
      SELECT tc.*, 
             r.nombre AS reunion, 
             r.ciudad AS ciudad, 
             r.tipo AS reunion_tipo, 
             r.pais AS pais,
             p.nombre AS expositor_nombre,
             m.anio AS memoria_anio,
             g.nombre AS grupo_nombre
      FROM trabajos_congresos tc
      LEFT JOIN reuniones r ON tc.reunion_id = r.id
      LEFT JOIN personal p ON tc.expositor_id = p.id
      LEFT JOIN memorias m ON tc.memoria_id = m.id
      LEFT JOIN grupos g ON m.grupo_id = g.id
      WHERE tc.id = $1 AND tc.deleted_at IS NULL
    `;
    const r = await pool.query(q, [id]);
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
  if (data.memoria_id !== undefined) { updates.push(`memoria_id = $${idx++}`); params.push(data.memoria_id); }
  if (data.fecha_presentacion !== undefined) { updates.push(`fecha_presentacion = $${idx++}`); params.push(data.fecha_presentacion); }

  if (!updates.length) return null;

  params.push(id);


  const q = `
      UPDATE trabajos_congresos 
      SET ${updates.join(', ')} 
      WHERE id = $${idx} AND deleted_at IS NULL 
      RETURNING *`;

  const r = await pool.query(q, params);
  return r.rows.length ? r.rows[0] : null;
}

  static async delete (id: number) {

  const q = `
      UPDATE trabajos_congresos 
      SET deleted_at = NOW() 
      WHERE id = $1 AND deleted_at IS NULL 
      RETURNING id`;

  const r = await pool.query(q, [id]);
  return r.rows.length > 0;
}
}

