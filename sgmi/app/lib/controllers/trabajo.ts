import { TrabajoModel, ITrabajo } from "../models/trabajo";
import { ReunionModel } from "../models/reunion";
import { PersonalModel } from "../models/personal";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class TrabajoController {
  static async create(payload: any) {
    try {
      // Si el cliente envía nombreReunion/ciudad en lugar de reunion_id, intentar resolver o crear la reunión
      if (!payload.reunion_id && payload.nombreReunion) {
        const nombre = String(payload.nombreReunion).trim();
        const ciudad = payload.ciudad ? String(payload.ciudad).trim() : null;
        const pais = payload.pais ? String(payload.pais).trim() : null;

        let reunion = await ReunionModel.findByNameCity(nombre, ciudad);
        if (!reunion) {
          // Mapear tipo (cliente envía 'nacional'|'internacional') a formato DB
          const tipoStr = String(payload.tipo || "").toUpperCase();
          const tipo = tipoStr === "INTERNACIONAL" ? "INTERNACIONAL" : "NACIONAL";
          reunion = await ReunionModel.create({ nombre, ciudad, tipo, pais });
        } else {
          // Si ya existe pero el cliente envió tipo/pais, intentar actualizar la reunión existente
          const tipoStr = String(payload.tipo || "").toUpperCase();
          const tipo = tipoStr === "INTERNACIONAL" ? "INTERNACIONAL" : "NACIONAL";
          await ReunionModel.update(reunion.id, { tipo, pais, ciudad, nombre });
        }

        payload.reunion_id = reunion.id;
      }

      const cleanPayload: ITrabajo = {
        titulo: payload.titulo,
        resumen: payload.resumen || undefined,
        expositor_id: payload.expositor_id || null,
        reunion_id: payload.reunion_id || null,
        memoria_id: payload.memoria_id || null,
        fecha_presentacion: payload.fecha_presentacion || null,
      };

      // Si el cliente envía un nombre de expositor, buscar o crear
      if (!cleanPayload.expositor_id && payload.expositor) {
        const nombreCompleto = String(payload.expositor).trim();
        let persona = await PersonalModel.findByName(nombreCompleto);
        if (!persona) {
          persona = await PersonalModel.create({ nombre: nombreCompleto });
        }
        cleanPayload.expositor_id = persona.id;
      }

      const r = await TrabajoModel.create(cleanPayload);
      
      // Buscar el registro con los JOINs enriquecidos
      if (r.id) {
      const enriched = await TrabajoModel.findById(r.id);
    }
      const allTrabajos = await TrabajoModel.findAll();
      const full = allTrabajos.find(t => t.id === r.id);
      
      return { success: true, data: full || r, message: "Trabajo creado" };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  static async getAll(opst?: {
    grupoId?: number;
    memoriaId?: number;
    cursor?: string | null;
    q?: string;
    reunionTipo?: "NACIONAL" | "INTERNACIONAL";
  }) {
    try {
      const data = await TrabajoModel.findAllpaginado(opst);
      return { success: true,items: data.items, nextCursor: data.nextCursor, hasMore: data.hasMore };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  static async getById(id: number) {
    try {
      const item = await TrabajoModel.findById(id);
      if (!item) return { success: false, error: "No encontrado" };
      return { success: true, data: item };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  static async update(id: number,  payload: any) {
    
    try {
      // Si el cliente envía nombreReunion/ciudad en lugar de reunion_id, intentar resolver o crear la reunión
      if (!payload.reunion_id && payload.nombreReunion) {
        const nombre = String(payload.nombreReunion).trim();
        const ciudad = payload.ciudad ? String(payload.ciudad).trim() : null;
        const pais = payload.pais ? String(payload.pais).trim() : null;

        let reunion = await ReunionModel.findByNameCity(nombre, ciudad);
        if (!reunion) {
          const tipoStr = String(payload.tipo || "").toUpperCase();
          const tipo = tipoStr === "INTERNACIONAL" ? "INTERNACIONAL" : "NACIONAL";
          reunion = await ReunionModel.create({ nombre, ciudad, tipo, pais });
        } else {
          // Si ya existe la reunión, actualizar sus datos si el payload trae cambios
          const tipoStr = String(payload.tipo || "").toUpperCase();
          const tipo = tipoStr === "INTERNACIONAL" ? "INTERNACIONAL" : "NACIONAL";
          await ReunionModel.update(reunion.id, { tipo, pais, ciudad, nombre });
        }

        payload.reunion_id = reunion.id;
      }

      const cleanPayload: Partial<ITrabajo> = {
        titulo: payload.titulo !== undefined ? payload.titulo : undefined,
        resumen: payload.resumen !== undefined ? payload.resumen : undefined,
        expositor_id:
          payload.expositor_id !== undefined ? payload.expositor_id : undefined,
        reunion_id:
          payload.reunion_id !== undefined ? payload.reunion_id : undefined,
        memoria_id:
          payload.memoria_id !== undefined ? payload.memoria_id : undefined,
        fecha_presentacion:
          payload.fecha_presentacion !== undefined
            ? payload.fecha_presentacion
            : undefined,
      };

      // Si el cliente envía un nombre de expositor, buscar o crear
      if (
        (!cleanPayload.expositor_id || cleanPayload.expositor_id === null) &&
        payload.expositor
      ) {
        const nombreCompleto = String(payload.expositor).trim();
        let persona = await PersonalModel.findByName(nombreCompleto);
        if (!persona) {
          persona = await PersonalModel.create({ nombre: nombreCompleto });
        }
        cleanPayload.expositor_id = persona.id;
      }

      const updated = await TrabajoModel.update(id, cleanPayload);
      if (!updated) return { success: false, error: "No se pudo actualizar" };
      
      // Buscar el registro con los JOINs enriquecidos
      const allTrabajos = await TrabajoModel.findAll();
      const full = allTrabajos.find(t => t.id === id);
      
      return { success: true, data: full || updated };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  static async delete(id: number) {
    
    try {
      const ok = await TrabajoModel.delete(id);
      if (!ok) return { success: false, error: "No encontrado" };
      return { success: true, message: "Eliminado" };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
