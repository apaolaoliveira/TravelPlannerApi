import { FastifyInstance } from "fastify";
import { createActivity } from "./create-activity";
import { deleteActivity } from "./delete-activity";
import { getActivities } from "./get-activities";

export async function activitiesRoutes(app: FastifyInstance){
  app.register(createActivity);
  app.register(deleteActivity);
  app.register(getActivities);
}
