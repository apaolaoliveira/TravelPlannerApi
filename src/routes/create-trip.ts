import { z } from 'zod';
import dayjs from 'dayjs';
import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';
import { FastifyInstance } from "fastify";
import { getEmailClient } from '../lib/mail';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/trips', {
    schema: {
      body: z.object({
        destination: z.string().min(4),
        starts_at: z.coerce.date(),
        ends_at: z.coerce.date(),
        owner_name: z.string(),
        owner_email: z.string().email(),
      })
    }
  }, async (request) => {
    const { destination, starts_at, ends_at, owner_email, owner_name } = request.body;

    if(dayjs(starts_at).isBefore(new Date())) 
      throw new Error('Invalid trip start date.')
    
    if(dayjs(ends_at).isBefore(starts_at))
      throw new Error('Invalid trip end date.')

    const trip = await prisma.trip.create({
      data: {
        destination,
        starts_at,
        ends_at,
      }
    })

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
      subject: 'New trip scheduled',
      text: `Hello ${owner_name},
      A new trip has been scheduled for ${destination} from ${dayjs(starts_at).format('DD/MM/YYYY')} to ${dayjs(ends_at).format('DD/MM/YYYY')}.
      Please confirm this trip by replying to this email.
      Best regards,
      Travel Planner team.`
    })

    console.log(nodemailer.getTestMessageUrl(message))

    return { tripId: trip.id }
  })
}