import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envScheme = z.object({
  DATABASE_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
  WEB_BASE_URL: z.string().url(),
  RESEND_API_KEY: z.string(), 
});

export const env = envScheme.parse(process.env);