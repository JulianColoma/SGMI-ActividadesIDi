import { GrupoModel, IGrupo } from '../models/grupo';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  items?: any[];
  hasMore?: boolean;
  nextCursor?: string | null;
}

export class GrupoController {
  /**
   * Crear un nuevo grupo (solo admin)
   */
  static async create(
    nombre: string,
  ): Promise<ApiResponse<IGrupo>> {
    
    try {
      const nombreTrim = nombre.trim();
      
      // Chequeo de duplicados
      const existente = await GrupoModel.findByNombre(nombreTrim);
      if (existente) {
        return { success: false, error: `Ya existe un grupo con el nombre "${nombreTrim}"` };
      }

      const grupo = await GrupoModel.create({
        nombre: nombreTrim,
      });

      return {
        success: true,
        data: grupo,
        message: 'Grupo creado exitosamente'
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al crear el grupo' };
    }
  }

  /**
   * Obtener todos los grupos (todos los roles pueden ver)
   */
  static async getAll(opts?: {
    cursor?: string | null;
    q?: string;
    paginado?: boolean;
  }): Promise<ApiResponse<any>> {
    try {
      if (opts?.paginado || opts?.cursor || opts?.q?.trim()) {
        const page = await GrupoModel.findAllPaginado(opts);
        return {
          success: true,
          items: page.items,
          hasMore: page.hasMore,
          nextCursor: page.nextCursor,
        };
      }
      const grupos = await GrupoModel.findAll();
      return { success: true, data: grupos };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al obtener los grupos' };
    }
  }

  /**
   * Obtener un grupo por ID
   */
  static async getById(grupoId: number): Promise<ApiResponse<IGrupo>> {
    try {
      if (!grupoId || grupoId <= 0) {
        return { success: false, error: 'ID de grupo inválido' };
      }

      const grupo = await GrupoModel.findById(grupoId);
      if (!grupo) return { success: false, error: 'Grupo no encontrado' };

      return { success: true, data: grupo };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al obtener el grupo' };
    }
  }

  /**
   * Actualizar un grupo (solo admin)
   */
  static async update(
    grupoId: number,
    datos: Partial<IGrupo>
  ): Promise<ApiResponse<IGrupo>> {
    

    try {
      if (!grupoId || grupoId <= 0) return { success: false, error: 'ID de grupo inválido' };

      if (datos.nombre) {
        const nombreTrim = datos.nombre.trim();
        const existente = await GrupoModel.findByNombre(nombreTrim);
        
        // Si existe un grupo con ese nombre y no es el mismo que estamos editando
        if (existente && existente.id !== grupoId) {
          return { success: false, error: `Ya existe otro grupo con el nombre "${nombreTrim}"` };
        }
        datos.nombre = nombreTrim;
      }

      const grupoActualizado = await GrupoModel.update(grupoId, datos);
      if (!grupoActualizado) return { success: false, error: 'No se pudo actualizar el grupo' };

      return { success: true, data: grupoActualizado, message: 'Grupo actualizado exitosamente' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al actualizar el grupo' };
    }
  }

  /**
   * Eliminar un grupo (solo admin)
   */
  static async delete(grupoId: number): Promise<ApiResponse<null>> {
    
    try {
      if (!grupoId || grupoId <= 0) return { success: false, error: 'ID de grupo inválido' };

      const eliminado = await GrupoModel.delete(grupoId);
      if (!eliminado) return { success: false, error: 'No se pudo eliminar el grupo' };

      return { success: true, message: 'Grupo eliminado exitosamente' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al eliminar el grupo' };
    }
  }
}
