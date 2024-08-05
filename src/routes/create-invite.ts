import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from 'fastify-type-provider-zod'; 
import dayjs from 'dayjs';
import { getEmailClient } from '../lib/mail';
import nodemailer from 'nodemailer';

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/invite', {
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        email: z.string().email(),
      })
    }
  }, async (request) => {
    const { tripId } = request.params;
    const { email } = request.body;

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) throw new Error('Trip not found');

    const participant = await prisma.participant.create({
      data: {
        email,
        trip_id: tripId,
      }
    });

    const formattedStartDate = dayjs(trip.starts_at).format('MM/DD/YYYY');
    const formattedEndDate = dayjs(trip.ends_at).format('MM/DD/YYYY');

    const mail = await getEmailClient();
    const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm`;
    
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