import fastify from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { errorHandler } from './error-handler';
import { activitiesRoutes } from './routes/activity';
import { linksRoutes } from './routes/link';
import { participantsRoutes } from './routes/participant';
import { tripRoutes } from './routes/trip';

const app = fastify();
const port = Number(process.env.PORT) || 4000;
const host = "0.0.0.0";

app.register(cors, {
  origin: '*', // add frontend url here
});

app.setErrorHandler(errorHandler);
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(activitiesRoutes);
app.register(linksRoutes);
app.register(participantsRoutes);
app.register(tripRoutes);

app.listen({port: port, host: host}, () => {
  console.log(`Server is running on port ${port}`);
});