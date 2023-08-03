import { type FastifyPluginAsync } from "fastify";
import { getStorageBucketName, storage } from "../services/storage.js";

export const reportRoute: FastifyPluginAsync = async function (server) {
  server.route({
    method: "GET",
    schema: {
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            publicUrl: { type: "string" },
          },
        },
      },
    },
    url: "/report/:id",
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      const publicUrl = await storage
        .bucket(getStorageBucketName())
        .file(`${id}-report.json`)
        .getSignedUrl({
          action: "read",
          expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 day
        });

      reply.send({ publicUrl });
    },
  });
};
