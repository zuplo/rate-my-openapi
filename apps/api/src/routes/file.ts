import { type FastifyPluginAsync } from "fastify";
import { getStorageBucketName, storage } from "../services/storage.js";
import {
  logAndReplyInternalError,
  successJsonReply,
} from "../helpers/reply.js";

export const fileRoute: FastifyPluginAsync = async function (server) {
  server.route({
    method: "GET",
    schema: {
      params: {
        type: "object",
        required: ["fileName"],
        properties: {
          fileName: { type: "string" },
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
    url: "/file/:fileName",
    handler: async (request, reply) => {
      const { fileName } = request.params as { fileName: string };

      try {
        const publicUrl = await storage
          .bucket(getStorageBucketName())
          .file(fileName)
          .getSignedUrl({
            action: "read",
            expires: Date.now() + 1000 * 60 * 60 * 24, // 1 day
          });

        return successJsonReply({ publicUrl }, reply);
      } catch (err) {
        return logAndReplyInternalError(err, request, reply);
      }
    },
  });
};
