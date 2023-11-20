import { ApiError, Problems } from "@zuplo/errors";
import { type FastifyPluginAsync } from "fastify";
import { getStorageBucketName, getStorageClient } from "../services/storage.js";

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
    url: "/files/:fileName",
    handler: async (request, reply) => {
      const { fileName } = request.params as { fileName: string };

      const [fileExists] = await getStorageClient()
        .bucket(getStorageBucketName())
        .file(fileName)
        .exists();

      if (!fileExists) {
        throw new ApiError({
          ...Problems.NOT_FOUND,
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
