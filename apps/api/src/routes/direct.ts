import { ApiError, Problems } from "@zuplo/errors";
import { type FastifyPluginAsync } from "fastify";
import { randomUUID } from "node:crypto";
import { runRatingWorker } from "../lib/rating.js";
import { assertValidFileExtension } from "../lib/types.js";
import { getStorageBucketName, getStorageClient } from "../services/storage.js";
import { parseMultipartUpload } from "./upload.js";

const directUploadRoute: FastifyPluginAsync = async function (server) {
  server.route({
    method: "POST",
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    url: "/direct",
    handler: async (request, reply) => {
      const parts = request.files({ preservePath: true });
      const parsed = await parseMultipartUpload(parts);

      const reportId = randomUUID();
      const { fileContentString: content, fileExtension } = parsed;
      try {
        assertValidFileExtension(fileExtension);
      } catch (err) {
        throw new ApiError({
          ...Problems.BAD_REQUEST,
          detail: err.message,
        });
      }

      const fileName = `${reportId}.${fileExtension}`;

      await getStorageClient()
        .bucket(getStorageBucketName())
        .file(fileName)
        .save(content);

      runRatingWorker({ reportId, fileExtension, email: undefined }).catch(
        (err) => {
          request.log.error(err);
        },
      );

      reply.send({
        reportId,
        reportUrl: `https://ratemyopenapi.com/rating/${reportId}`,
      });
    },
  });
};

export default directUploadRoute;
