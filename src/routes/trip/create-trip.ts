import { z } from 'zod';
import dayjs from 'dayjs';
import { prisma } from '../../lib/prisma';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ClientError } from '../../errors/client-error';
import { env } from '../../env';
import { sendGuestInviteEmail, sendOwnerEmail } from '../../lib/mail-service';

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/trips', {
    schema: {
      body: z.object({
        destination: z.string().min(4),
        starts_at: z.coerce.date(),
        ends_at: z.coerce.date(),
        owner_name: z.string(),
        owner_email: z.string().email(),
        emails_to_invite: z.array(z.string().email()),
      }),
    },
  }, async (request) => {
    const { destination, starts_at, ends_at, owner_email, owner_name, emails_to_invite } = request.body;

    if (dayjs(starts_at).isBefore(new Date()))
      throw new ClientError('Invalid trip start date.');

    if (dayjs(ends_at).isBefore(starts_at))
      throw new ClientError('Invalid trip end date.');

    const trip = await prisma.trip.create({
      data: {
        destination,
        starts_at,
        ends_at,
        participants: {
          createMany: {
            data: [
              {
                name: owner_name,
                email: owner_email,
                is_confirmed: true,
                is_owner: true,
              },
              ...emails_to_invite.map(email => ({ email })),
            ],
          },
        },
      },
    });

    const guests = await prisma.participant.findMany({
      where: {
        trip_id: trip.id,
        is_owner: false
      }
    });
    
    const formattedStartDate = dayjs(starts_at).format('MM/DD/YYYY');
    const formattedEndDate = dayjs(ends_at).format('MM/DD/YYYY');

    try {
      await sendOwnerEmail({
        name: owner_name,
        email: owner_email,
        destination,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        guestList: emails_to_invite
      });

      await Promise.all(
        guests.map(async (guest) => {
          const confirmationLink = `${env.API_BASE_URL}/participants/${guest.id}/confirm`;

          console.log(`🔔 Enviando email para guest: ${guest.email}`);
      
          await sendGuestInviteEmail({
            name: guest.name || 'Guest',
            email: guest.email,
            destination,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            confirmationLink,
            ownerName: owner_name
          });
        })
      );      
    } catch (error) {
      console.error(`Failed to send emails`, error);
    }

    return { tripId: trip.id };
  });
}
