import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envScheme = z.object({
  DATABASE_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
  WEB_BASE_URL: z.string().url(),
});

export const env = envScheme.parse(process.env);