import { z } from 'zod';

export const GrupoSchema = z.object({
  nombre: z.string({
    required_error: 'El nombre del grupo es obligatorio',
    invalid_type_error: 'El nombre debe ser un texto válido',
  })
    .trim() 
    .min(3, 'El nombre debe tener al menos 3 caracteres') 
    .max(255, 'El nombre no puede superar los 255 caracteres'),
});

// Para el POST 
export type CreateGrupoInput = z.infer<typeof GrupoSchema>;

// Para el PUT/PATCH 
export const UpdateGrupoSchema = GrupoSchema.partial();
export type UpdateGrupoInput = z.infer<typeof UpdateGrupoSchema>;