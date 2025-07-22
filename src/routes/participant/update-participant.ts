import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from 'fastify-type-provider-zod'; 
import { ClientError } from '../../errors/client-error';
import dayjs from 'dayjs';
import { env } from '../../env';
import { sendGuestInviteEmail } from '../../lib/mail-service';

export async function updateParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/trips/:tripId/participant/:participantId', {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
        participantId: z.string().uuid(),
      }),
      body: z.object({
        name: z.string().min(4),
        email: z.string().email(),
      })
    }
  }, async (request) => {
    const { tripId, participantId } = request.params;
    const { name, email } = request.body;

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) throw new ClientError('Trip not found');

    const participant = await prisma.participant.update({
      where: { id: participantId, trip_id: tripId },
      data: {
        name, email
      }
    });

    const owner = await prisma.participant.findFirst({
      where: {
        trip_id: tripId,
        is_owner: true,
      },
    })

    const formattedStartDate = dayjs(trip.starts_at).format('MM/DD/YYYY');
    const formattedEndDate = dayjs(trip.ends_at).format('MM/DD/YYYY');

    const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`;

    try {
      await sendGuestInviteEmail({
        name: participant.name || 'Guest',
        email: participant.email,
        destination: trip.destination,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        confirmationLink,
        ownerName: owner?.name || 'Trip Owner',
      });
    } catch (error) {
      console.error(`Failed to send invitation email to ${participant.email}`, error);
    }
    
    return { participantId: participant.id };
  })
}