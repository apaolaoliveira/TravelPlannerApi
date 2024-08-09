import { FastifyInstance } from "fastify";
import { confirmTrip } from "./confirm-trip";
import { createInvite } from "./create-invite";
import { createTrip } from "./create-trip";
import { getTripDetails } from "./get-trip-details";
import { updateTrip } from "./update-trip";

export async function tripRoutes(app: FastifyInstance){
  app.register(confirmTrip);
  app.register(createInvite);
  app.register(createTrip);
  app.register(getTripDetails);
  app.register(updateTrip);
}