import { z } from 'zod';

export const createTrabajoSchema = z.object({
  titulo: z.string({ 
      required_error: 'El título es requerido',
      invalid_type_error: 'El título debe ser un texto válido'
    })
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(255, 'El título no puede superar los 255 caracteres'), 

  resumen: z.string({
      invalid_type_error: 'El resumen debe ser un texto válido'
    })
    .trim()
    .optional()
    .nullable(),

  expositor_id: z.number({
      invalid_type_error: 'El ID del expositor debe ser un número válido'
    })
    .int('El ID del expositor debe ser un número entero')
    .positive('El ID del expositor debe ser un número positivo')
    .optional()
    .nullable(),

  reunion_id: z.number({
      invalid_type_error: 'El ID de la reunión debe ser un número válido'
    })
    .int('El ID de la reunión debe ser un número entero')
    .positive('El ID de la reunión debe ser un número positivo')
    .optional()
    .nullable(),


  memoria_id: z.number({ 
      required_error: 'El ID de la memoria es requerido',
      invalid_type_error: 'El ID de la memoria debe ser un número válido'
    })
    .int('El ID de la memoria debe ser un número entero')
    .positive('El ID de la memoria debe ser un número positivo'),

  fecha_presentacion: z.string({
      invalid_type_error: 'La fecha de presentación debe ser válida'
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'El formato de la fecha debe ser YYYY-MM-DD')
    .optional()
    .nullable()
});

export const updateTrabajoSchema = createTrabajoSchema.partial();

export type CreateTrabajoInput = z.infer<typeof createTrabajoSchema>;
export type UpdateTrabajoInput = z.infer<typeof updateTrabajoSchema>;