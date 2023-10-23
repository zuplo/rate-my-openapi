import { type FastifyPluginAsync } from "fastify";
import {
  logAndReplyError,
  logAndReplyInternalError,
} from "../helpers/reply.js";
import { getStorageBucketName, storage } from "../services/storage.js";

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
        const [fileExists] = await storage
          .bucket(getStorageBucketName())
          .file(fileName)
          .exists();

        if (!fileExists) {
          return logAndReplyError({
            errorResult: {
              debugMessage: `File ${fileName} does not exist`,
              userMessage: `File ${fileName} does not exist.`,
              statusCode: 404,
            },
            fastifyRequest: request,
            fastifyReply: reply,
          });
        }

        reply.hijack();
        reply.raw.setHeader("Content-Type", "application/json; charset=utf-8");
        reply.raw.setHeader("Access-Control-Allow-Origin", "*");
        return storage
          .bucket(getStorageBucketName())
          .file(fileName)
          .createReadStream()
          .pipe(reply.raw);
      } catch (err) {
        return logAndReplyInternalError({
          error: err,
          fastifyRequest: request,
          fastifyReply: reply,
        });
      }
    },
  });
};
