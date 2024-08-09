import { FastifyInstance } from "fastify";
import { getParticipants } from "./get-participants";
import { getParticipant } from "./get-participant";
import { confirmParticipant } from "./confirm-participant";

export async function participantsRoutes(app: FastifyInstance){
  app.register(confirmParticipant);
  app.register(getParticipant);
  app.register(getParticipants);
}