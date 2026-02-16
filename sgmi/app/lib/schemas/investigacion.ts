import { z } from 'zod';


const baseInvestigacionSchema = z.object({
  tipo: z.string({ required_error: 'El tipo es requerido' })
    .trim()
    .min(1, 'El tipo no puede estar vacío')
    .max(50, 'El tipo no puede superar los 50 caracteres'),

  codigo: z.string()
    .trim()
    .max(50, 'El código no puede superar los 50 caracteres')
    .optional()
    .nullable(),

  fecha_inicio: z.string({ required_error: 'La fecha de inicio es requerida' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'El formato de la fecha debe ser YYYY-MM-DD'),

  fecha_fin: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'El formato de la fecha debe ser YYYY-MM-DD')
    .optional()
    .nullable(),

  nombre: z.string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede superar los 255 caracteres'),

  descripcion: z.string().trim().optional().nullable(),
  logros: z.string().trim().optional().nullable(),
  dificultades: z.string().trim().optional().nullable(),
  fuente_financiamiento: z.string().trim().optional().nullable(),

  memoria_id: z.number({ required_error: 'El ID de la memoria es requerido' })
    .int('El ID debe ser un número entero')
    .positive('El ID debe ser un número positivo')
});

//  lógica de validación de fechas 
const validarFechas = (data: any, ctx: z.RefinementCtx) => {
  // Solo validamos si ambas fechas vienen en el request 
  if (data.fecha_inicio && data.fecha_fin) {
    const inicio = new Date(data.fecha_inicio);
    const fin = new Date(data.fecha_fin);

    if (fin < inicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin no puede ser anterior a la fecha de inicio',
        path: ['fecha_fin'],
      });
    }
  }
};


export const createInvestigacionSchema = baseInvestigacionSchema.superRefine(validarFechas);


export const updateInvestigacionSchema = baseInvestigacionSchema.partial().superRefine(validarFechas);

export type CreateInvestigacionInput = z.infer<typeof createInvestigacionSchema>;
export type UpdateInvestigacionInput = z.infer<typeof updateInvestigacionSchema>;