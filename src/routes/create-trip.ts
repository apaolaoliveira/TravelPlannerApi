import { z } from 'zod';
import dayjs from 'dayjs';
import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';
import { FastifyInstance } from "fastify";
import { getEmailClient } from '../lib/mail';
import { ZodTypeProvider } from 'fastify-type-provider-zod'; 
import { ClientError } from '../errors/client-error';

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
      })
    }
  }, async (request) => {
    const { destination, starts_at, ends_at, owner_email, owner_name, emails_to_invite } = request.body;

    if(dayjs(starts_at).isBefore(new Date())) 
      throw new ClientError('Invalid trip start date.');
    
    if(dayjs(ends_at).isBefore(starts_at))
      throw new ClientError('Invalid trip end date.');

    const trip = await prisma.trip.create({
      data: {
        destination,
        starts_at,
        ends_at,
        participants : {
          createMany: {
            data: [
              {
                name: owner_name,
                email: owner_email,
                is_confirmed: true,
                is_owner: true
              },
              ...emails_to_invite.map(email => {
                return { email }
              })
            ]
          }
        }
      }
    });

    const formattedStartDate = dayjs(starts_at).format('MM/DD/YYYY');
    const formattedEndDate = dayjs(ends_at).format('MM/DD/YYYY');

    const confirmationLink = `http://localhost:3000/trips/${trip.id}/confirm`;

    const mail = await getEmailClient();

    const message = await mail.sendMail({
      from: {
        name: 'Travel Planner team',
        address: 'traver.planner@team.com'
      },
      to: {
        name: owner_name,
        address: owner_email
      },
      subject: `Confirm your trip to ${destination} on ${formattedStartDate}`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>Hello, ${owner_name}!</p>
          <p>
            A new trip has been scheduled to <strong>${destination}</strong> from 
            <strong>${formattedStartDate}</strong> 
            to <strong>${formattedEndDate}</strong>.
          </p>
        
          <p>Confirm this trip by the clicking the link below:</p>
          <a href="${confirmationLink}">Confirm trip</a>
        
          <p>If you didn't request this email, please ignore it.</p>
        
          <em>Best regards,</em><br/>
          <strong>Travel Planner team.</strong>    
        </div>
      `.trim()
    });

    console.log(nodemailer.getTestMessageUrl(message));

    return { tripId: trip.id };
  })
}