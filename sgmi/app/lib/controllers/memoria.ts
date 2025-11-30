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

  static async getAll(grupoId?: number) {
    try {
      const data = await MemoriaModel.findAll(grupoId);
      return { success: true, data };
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

  static async update(id: number, role: string, payload: Partial<IMemoria>) {
    if (role !== "admin") return { success: false, error: "No autorizado" };
    try {
      const updated = await MemoriaModel.update(id, payload);
      if (!updated) return { success: false, error: "No se pudo actualizar" };
      return { success: true, data: updated };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  static async delete(id: number, role: string) {
    if (role !== "admin") return { success: false, error: "No autorizado" };
    try {
      const ok = await MemoriaModel.delete(id);
      if (!ok) return { success: false, error: "No encontrado" };
      return { success: true, message: "Eliminado" };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
