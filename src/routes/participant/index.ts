import { FastifyInstance } from "fastify";
import { getParticipants } from "./get-participants";
import { getParticipant } from "./get-participant";
import { confirmParticipant } from "./confirm-participant";
import { updateParticipant } from "./update-participant";
import { deleteParticipant } from "./delete-participant";

export async function participantsRoutes(app: FastifyInstance){
  app.register(confirmParticipant);
  app.register(getParticipant);
  app.register(getParticipants);
  app.register(updateParticipant);
  app.register(deleteParticipant);
}