import { FastifyInstance } from "fastify";
import { createLink } from "./create-link";
import { deleteLink } from "./delete-link";
import { getLinks } from "./get-links";

export async function linksRoutes(app: FastifyInstance){
  app.register(createLink);
  app.register(deleteLink);
  app.register(getLinks);
}