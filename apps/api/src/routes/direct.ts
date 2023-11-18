import { ApiError, Problems } from "@zuplo/errors";
import { type FastifyPluginAsync } from "fastify";
import { randomUUID } from "node:crypto";
import { createTempFile, getReport } from "../lib/rating.clean.js";
import { uploadReport } from "../lib/rating.js";
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
    onRequest: [server.validateApiKey],
    handler: async (request, reply) => {
      const parts = request.files({ preservePath: true });
      const parsed = await parseMultipartUpload(parts);
      if (parsed.err) {
        throw new ApiError({
          ...Problems.BAD_REQUEST,
          detail: parsed.val.userMessage,
        });
      }

      const reportId = randomUUID();
      const { fileContentString: content, fileExtension } = parsed.val;
      if (!["json", "yaml"].includes(fileExtension)) {
        throw new ApiError({
          ...Problems.BAD_REQUEST,
          detail: `Invalid file extension`,
        });
      }

      const fileName = `${reportId}.${fileExtension}`;

      await getStorageClient()
        .bucket(getStorageBucketName())
        .file(fileName)
        .save(content);

      const tempApiFilePath = await createTempFile({
        fileId: reportId,
        fileExtension: fileExtension as "json" | "yaml",
        content: content,
      });

      const reportResult = await getReport({
        fileContent: content,
        fileExtension: fileExtension as "json" | "yaml",
        reportId,
        openAPIFilePath: tempApiFilePath,
      });

      await uploadReport({
        reportId,
        ...reportResult,
      });
      reply.send({
        reportId,
        reportUrl: `https://ratemyopenapi.com/rating/${reportId}`,
      });
    },
  });
};

export default directUploadRoute;
