import { z } from 'zod';

export const createInvestigacionSchema = z.object({
  tipo: z.string().min(1),
  codigo: z.string().optional(),
  fecha_inicio: z.string(),
  fecha_fin: z.string().optional(),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  logros: z.string().optional(),
  dificultades: z.string().optional(),
  fuente_financiamiento: z.string().optional(),
  memoria_id: z.number().int().positive()
});

export const updateInvestigacionSchema = createInvestigacionSchema.partial();

export type UpdateInvestigacionInput = z.infer<typeof updateInvestigacionSchema>;
