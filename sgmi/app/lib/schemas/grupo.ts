import { z } from 'zod';

export const GrupoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
});


export type CreateGrupoInput = z.infer<typeof GrupoSchema>;

