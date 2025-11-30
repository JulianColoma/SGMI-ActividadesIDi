import { z } from 'zod';

export const createTrabajoSchema = z.object({
  titulo: z.string().min(1),
  resumen: z.string().optional(),
  expositor_id: z.number().int().positive().nullable().optional(),
  reunion_id: z.number().int().positive().nullable().optional(),
  memoria_id: z.number().int().positive().nullable().optional(),
  fecha_presentacion: z.string().optional()
});

export const updateTrabajoSchema = createTrabajoSchema.partial();

export type CreateTrabajoInput = z.infer<typeof createTrabajoSchema>;
export type UpdateTrabajoInput = z.infer<typeof updateTrabajoSchema>;
