import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from 'fastify-type-provider-zod'; 
import { ClientError } from '../../errors/client-error';

export async function deleteParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete('/trips/:tripId/participant/:participantId', {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
        participantId: z.string().uuid(),
      }),
    }
  }, async (request) => {
    const { tripId, participantId } = request.params;

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) throw new ClientError('Trip not found');

    await prisma.participant.delete({
      where: { id: participantId, trip_id: tripId },
    });
    
    return 'Participant deleted successfully';
  })
}