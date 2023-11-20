import { ApiError, Problems } from "@zuplo/errors";
import { type FastifyPluginAsync } from "fastify";
import { getStorageBucketName, getStorageClient } from "../services/storage.js";

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
    url: "/reports/:id",
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const fileName = `${id}-report.json`;

      const [fileExists] = await getStorageClient()
        .bucket(getStorageBucketName())
        .file(fileName)
        .exists();

      if (!fileExists) {
        throw new ApiError({
          ...Problems.BAD_REQUEST,
          detail: `File ${fileName} does not exist.`,
        });
      }

      reply.hijack();
      reply.raw.setHeader("Content-Type", "application/json; charset=utf-8");
      reply.raw.setHeader("Access-Control-Allow-Origin", "*");
      return getStorageClient()
        .bucket(getStorageBucketName())
        .file(fileName)
        .createReadStream()
        .pipe(reply.raw);
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
    url: "/reports/:id/simplified",
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const fileName = `${id}-simple-report.json`;

      const [fileExists] = await getStorageClient()
        .bucket(getStorageBucketName())
        .file(fileName)
        .exists();

      if (!fileExists) {
        throw new ApiError({
          ...Problems.BAD_REQUEST,
          detail: `File ${fileName} does not exist.`,
        });
      }

      reply.hijack();
      reply.raw.setHeader("Content-Type", "application/json; charset=utf-8");
      reply.raw.setHeader("Access-Control-Allow-Origin", "*");
      return getStorageClient()
        .bucket(getStorageBucketName())
        .file(fileName)
        .createReadStream()
        .pipe(reply.raw);
    },
  });
};
