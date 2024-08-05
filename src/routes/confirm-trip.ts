import { z } from 'zod';
import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from 'fastify-type-provider-zod'; 
import { prisma } from '../lib/prisma';
import dayjs from 'dayjs';
import { getEmailClient } from '../lib/mail';
import nodemailer from 'nodemailer';
import { ClientError } from '../errors/client-error';

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      })
    }
  }, async (request, reply) => {
    const { tripId } = request.params;

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        participants: {
          where: { is_owner: false }
        }
      }
    });

    if(!trip) throw new ClientError('Trip not found');
    if(trip.is_confirmed) return reply.redirect(`https://localhost:3000/trips/${trip.id}`);

    await prisma.trip.update({
      where: { id: tripId },
      data: { is_confirmed: true },
    });

    const formattedStartDate = dayjs(trip.starts_at).format('MM/DD/YYYY');
    const formattedEndDate = dayjs(trip.ends_at).format('MM/DD/YYYY');

    const mail = await getEmailClient();

    await Promise.all(
      trip.participants.map(async (participant) => {
        const confirmationLink = `http://localhost:3000/participants/${participant.id}/confirm`;
        const message = await mail.sendMail({
          from: {
            name: 'Travel Planner team',
            address: 'traver.planner@team.com'
          },
          to: participant.email,
          subject: `Confirm your participation on the trip to ${trip.destination} on ${formattedStartDate}`,
          html: `
            <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
              <p>Hello! Hope this email finds you well.</p>
              <p>
                You were invited to join a trip to <strong>${trip.destination}</strong>, which
                will take place from <strong>${formattedStartDate}</strong>
                and ends on <strong>${formattedEndDate}</strong>.
              </p>
            
              <p>Please confirm this participation by clicking the link below:</p>
              <a href="${confirmationLink}">Confirm trip</a>
            
              <p>If you don't recognize this email or are unable to attend, please ignore this message.</p>
            
              <em>Best regards,</em><br/>
              <strong>Travel Planner team.</strong>    
            </div>
          `.trim()
        });
    
        console.log(nodemailer.getTestMessageUrl(message));
      })
    );

    return reply.redirect(`https://localhost:3000/trips/${trip.id}`);
  })
}