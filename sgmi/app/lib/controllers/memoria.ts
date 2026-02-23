import { MemoriaModel, IMemoria } from "../models/memoria";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class MemoriaController {
  static async create(payload: IMemoria) {
    try {
      const r = await MemoriaModel.create(payload);
      return { success: true, data: r, message: "Memoria creada" };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }


  static async getById(id: number) {
    try {
      const item = await MemoriaModel.findById(id);
      if (!item) return { success: false, error: "No encontrado" };
      return { success: true, data: item };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  static async getAllByGrupo(opts: { grupoId: number; cursor?: string | null }) {
    try {
      const data = await MemoriaModel.findAllPaginadoByGrupo(opts);
      return {
        success: true,
        items: data.items,
        hasMore: data.hasMore,
        nextCursor: data.nextCursor,
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  static async delete(id: number) {
    try {
      const ok = await MemoriaModel.delete(id);
      if (!ok) return { success: false, error: "No encontrado" };
      return { success: true, message: "Eliminado" };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
