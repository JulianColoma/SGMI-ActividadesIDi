import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string({ required_error: 'El email es requerido' })
    .email('El formato del email no es válido')
    .trim()
    .toLowerCase() 
    .max(255, 'El email es demasiado largo'), 

  password: z.string({ required_error: 'La contraseña es requerida' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga') 
});

export const registerSchema = z.object({
  nombre: z.string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre no puede superar los 255 caracteres'), 

  email: z.string({ required_error: 'El email es requerido' })
    .email('El formato del email no es válido')
    .trim()
    .toLowerCase()
    .max(255, 'El email no puede superar los 255 caracteres'),

  password: z.string({ required_error: 'La contraseña es requerida' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),

 
  role: z.enum(['admin', 'user'], { 
      errorMap: () => ({ message: 'El rol debe ser admin o user' }) 
    })
    .default('user') 
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;