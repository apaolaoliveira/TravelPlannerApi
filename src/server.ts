import fastify from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { createTrip } from './routes/trip/create-trip';
import { confirmTrip } from './routes/trip/confirm-trip';
import { confirmParticipant } from './routes/participant/confirm-participant';
import { createActivity } from './routes/activity/create-activity';
import { getActivities } from './routes/activity/get-activities';
import { createLink } from './routes/link/create-link';
import { getLinks } from './routes/link/get-links';
import { getParticipants } from './routes/participant/get-participants';
import { updateTrip } from './routes/trip/update-trip';
import { getTripDetails } from './routes/trip/get-trip-details';
import { getParticipant } from './routes/participant/get-participant';
import { errorHandler } from './error-handler';
import { env } from './env';
import { createInvite } from './routes/trip/create-invite';
import { deleteActivity } from './routes/activity/delete-activity';

const app = fastify();

app.register(cors, {
  origin: '*', // add frontend url here
});

app.setErrorHandler(errorHandler);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);
app.register(updateTrip);
app.register(getTripDetails);
app.register(createInvite);

app.register(confirmParticipant);
app.register(getParticipants);
app.register(getParticipant);

app.register(createActivity);
app.register(getActivities);
app.register(deleteActivity);

app.register(createLink);
app.register(getLinks);

app.listen({ port: env.PORT}).then(() => {
  console.log(`Server is running on port ${3333}`);
});