import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from 'fastify-type-provider-zod'; 
import { ClientError } from '../../errors/client-error';
import dayjs from 'dayjs';
import { getEmailClient } from '../../lib/mail';
import { env } from '../../env';
import nodemailer from 'nodemailer';

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

    const formattedStartDate = dayjs(trip.starts_at).format('MM/DD/YYYY');
    const formattedEndDate = dayjs(trip.ends_at).format('MM/DD/YYYY');

    const mail = await getEmailClient();
    const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`;
    
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
      `.trim(),
    });
    
    console.log(nodemailer.getTestMessageUrl(message));
    
    return { participantId: participant.id };
  })
}