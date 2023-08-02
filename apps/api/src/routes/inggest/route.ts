import { type FastifyPluginAsync } from "fastify";
import {
  generateRatingInngest,
  inngestInstance,
} from "../../services/inngest.js";
import { inngestHandler } from "./handler.js";

export const inngestRoute: FastifyPluginAsync = async function (server) {
  server.route({
    method: ["GET", "POST", "PUT"],
    url: "/api/inngest",
    handler: inngestHandler(inngestInstance, [generateRatingInngest]),
  });
};
