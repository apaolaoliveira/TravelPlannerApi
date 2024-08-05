import fastify from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { createTrip } from './routes/create-trip';
import { confirmTrip } from './routes/confirm-trip';
import { confirmParticipant } from './routes/confirm-participant';
import { createActivity } from './routes/create-activity';
import { getActivities } from './routes/get-activities';
import { createLink } from './routes/create-link';
import { getLinks } from './routes/get-links';
import { getParticipants } from './routes/get-participants';
import { updateTrip } from './routes/update-trip';

const app = fastify();

app.register(cors, {
  origin: '*', // add frontend url here
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);
app.register(updateTrip);

app.register(confirmParticipant);
app.register(getParticipants);

app.register(createActivity);
app.register(getActivities);

app.register(createLink);
app.register(getLinks);

app.listen({ port: 3333}).then(() => {
  console.log(`Server is running on port ${3333}`);
});