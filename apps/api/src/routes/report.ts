import { type FastifyPluginAsync } from "fastify";
import { getStorageBucketName, storage } from "../services/storage.js";
import {
  logAndReplyError,
  logAndReplyInternalError,
} from "../helpers/reply.js";

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
      const fileName = `${id}-report.json`;

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
        return await storage
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
    url: "/report/:id/simplified",
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const fileName = `${id}-simple-report.json`;

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
        return await storage
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
