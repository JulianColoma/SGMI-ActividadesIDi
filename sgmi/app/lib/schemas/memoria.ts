import { z } from 'zod';

export const createMemoriaSchema = z.object({
  grupo_id: z.number({ 
      required_error: 'El ID del grupo es requerido',
      invalid_type_error: 'El ID del grupo debe ser un número válido'
    })
    .int('El ID del grupo debe ser un número entero')
    .positive('El ID del grupo debe ser un número positivo'),

  anio: z.number({ 
      required_error: 'El año es requerido',
      invalid_type_error: 'El año debe ser un número válido'
    })
    .int('El año debe ser un número entero')
    .min(2000, 'El año debe ser mayor o igual a 2000')
    .max(2100, 'El año ingresado excede el límite permitido'), 

  contenido: z.string({ 
      invalid_type_error: 'El contenido debe ser texto' 
    })
    .trim()
    .optional()
    .nullable() 
});

export const updateMemoriaSchema = createMemoriaSchema.partial();

export type CreateMemoriaInput = z.infer<typeof createMemoriaSchema>;
export type UpdateMemoriaInput = z.infer<typeof updateMemoriaSchema>;