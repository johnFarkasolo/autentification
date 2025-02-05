import { z } from 'zod';
import { loginSchema } from '../schemas/auth.schema';

export type LoginCredentials = z.infer<typeof loginSchema>;