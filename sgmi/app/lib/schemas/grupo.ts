import { z } from 'zod';

export const createGrupoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  descripcion: z.string().max(1000).optional(),
  facultad_id: z.number().int().positive().optional()
});

export const updateGrupoSchema = z.object({
  nombre: z.string().min(1).max(255).optional(),
  descripcion: z.string().max(1000).optional(),
  estado: z.boolean().optional(),
  facultad_id: z.number().int().positive().nullable().optional()
});

export type CreateGrupoInput = z.infer<typeof createGrupoSchema>;
export type UpdateGrupoInput = z.infer<typeof updateGrupoSchema>;
