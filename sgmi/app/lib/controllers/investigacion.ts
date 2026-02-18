import { InvestigacionModel, IInvestigacion } from "../models/investigacion";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class InvestigacionController {
  static async create(
    payload: IInvestigacion
  ): Promise<ApiResponse<IInvestigacion>> {
    try {
      const created = await InvestigacionModel.create(payload);
      return { success: true, data: created, message: "Investigación creada" };
    } catch (e: any) {
      return { success: false, error: e.message || "Error" };
    }
  }

  static async getAll(cursor?: string | null) {
    try {
      const { data, pageInfo } = await InvestigacionModel.findAllPaginado(cursor);
      return {
        success: true,
        items: data,
        hasMore: pageInfo?.hasNextPage ?? false,
        nextCursor: pageInfo?.nextCursor ?? null,
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  static async getById(id: number) {
    try {
      const item = await InvestigacionModel.findById(id);
      if (!item) return { success: false, error: "No encontrado" };
      return { success: true, data: item };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  static async update(id: number, payload: Partial<IInvestigacion>) {
    try {
      const updated = await InvestigacionModel.update(id, payload);
      if (!updated) return { success: false, error: "No se pudo actualizar" };
      return { success: true, data: updated };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  static async delete(id: number, role: string) {
    if (role !== "admin") return { success: false, error: "No autorizado" };
    try {
      const ok = await InvestigacionModel.delete(id);
      if (!ok) return { success: false, error: "No encontrado" };
      return { success: true, message: "Eliminado" };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
