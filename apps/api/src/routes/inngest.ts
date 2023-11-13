import { type FastifyPluginAsync } from "fastify";
import { serve } from "inngest/fastify";
import { generateRatingInngest, inngestInstance } from "../services/inngest.js";

export const inngestRoute: FastifyPluginAsync = async function (server) {
  server.route({
    logLevel: "warn",
    method: ["GET", "POST", "PUT"],
    url: "/inngest",
    handler: serve({
      client: inngestInstance,
      functions: [generateRatingInngest],
    }),
  });
};
