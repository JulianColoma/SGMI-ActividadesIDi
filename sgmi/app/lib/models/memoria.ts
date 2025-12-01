import pool from '../db';

export interface IMemoria {
  id?: number;
  grupo_id: number;
  anio: number;
  contenido?: string;
}

export class MemoriaModel {
  static async create(data: IMemoria) {
    const q = `INSERT INTO memorias (grupo_id, anio, contenido) VALUES ($1, $2, $3) RETURNING *`;
    const r = await pool.query(q, [data.grupo_id, data.anio, data.contenido || null]);
    return r.rows[0];
  }


  static async findById(id: number) {
    //  Buscar la memoria base CON el nombre del grupo
    const memoriaRes = await pool.query(
      `SELECT m.*, g.nombre AS grupo_nombre 
       FROM memorias m
       LEFT JOIN grupos g ON m.grupo_id = g.id
       WHERE m.id = $1`, 
      [id]
    );
    
    if (memoriaRes.rows.length === 0) return null;
    const memoria = memoriaRes.rows[0];

    //  Ejecutar consultas de Proyectos y Trabajos en paralelo
    const [proyectosRes, trabajosRes] = await Promise.all([
     
      pool.query(
        'SELECT * FROM investigaciones WHERE memoria_id = $1 ORDER BY id DESC', 
        [id]
      ),

      
      pool.query(
        `SELECT tc.*, 
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
         WHERE tc.memoria_id = $1
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



  static async delete(id: number) { const r = await pool.query('DELETE FROM memorias WHERE id = $1 RETURNING id', [id]); return r.rows.length > 0 }
}
