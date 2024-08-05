import { z } from 'zod';

const envScheme = z.object({
  DATABASE_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
  WEB_BASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3333),
});

export const env = envScheme.parse(process.env);