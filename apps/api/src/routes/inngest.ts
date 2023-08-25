import { type FastifyPluginAsync } from "fastify";
import { generateRatingInngest, inngestInstance } from "../services/inngest.js";
import { serve } from "inngest/fastify.js";

export const inngestRoute: FastifyPluginAsync = async function (server) {
  server.route({
    method: ["GET", "POST", "PUT"],
    url: "/inngest",
    handler: serve(inngestInstance, [generateRatingInngest]),
  });
};
