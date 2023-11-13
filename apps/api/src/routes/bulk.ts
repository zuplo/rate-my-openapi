import { type FastifyPluginAsync } from "fastify";
import { Err } from "ts-results-es";
import { v4 as uuidv4 } from "uuid";
import {
  logAndReplyError,
  logAndReplyInternalError,
  successJsonReply,
} from "../helpers/reply.js";
import { generateRating, uploadReport } from "../lib/rating.js";
import { getStorageBucketName, storage } from "../services/storage.js";
import { parseMultipartUpload } from "./upload.js";

const bulkUploadRoute: FastifyPluginAsync = async function (server) {
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
    url: "/bulk",
    preHandler: [server.validateApiKey],
    handler: async (request, reply) => {
      if (request.user?.metadata.role !== "automation") {
        return reply.status(401).send("Unauthorized");
      }

      const parts = request.parts();
      const parseResult = await parseMultipartUpload(parts);

      if (parseResult.err) {
        return logAndReplyError({
          errorResult: parseResult.val,
          fastifyRequest: request,
          fastifyReply: reply,
        });
      }

      if (!parseResult.val.email) {
        return logAndReplyError({
          errorResult: Err({
            userMessage: "Invalid request body. No email provided.",
            debugMessage: "Invalid request body. No email provided",
            statusCode: 400,
          }).val,
          fastifyRequest: request,
          fastifyReply: reply,
        });
      }

      // upload to google cloud storage
      const uuid = uuidv4();
      try {
        const fileName = `${uuid}.${parseResult.val.fileExtension}`;

        await storage
          .bucket(getStorageBucketName())
          .file(fileName)
          .save(parseResult.val.fileContentString);

        request.log.info(`Uploaded file ${uuid}`);
      } catch (err) {
        return logAndReplyInternalError({
          error: err,
          fastifyRequest: request,
          fastifyReply: reply,
        });
      }

      const ratingResult = await generateRating({
        reportId: uuid,
        fileExtension: parseResult.val.fileExtension as "json" | "yaml",
      });

      if (ratingResult.err) {
        request.log.error("Generate Rating failed: ", ratingResult.val);
        return logAndReplyInternalError({
          error: ratingResult.err,
          fastifyRequest: request,
          fastifyReply: reply,
        });
      }

      const uploadResult = await uploadReport({
        reportId: uuid,
        fullReport: ratingResult.val.fullReport,
        simpleReport: ratingResult.val.simpleReport,
      });

      if (uploadResult.err) {
        request.log.error("Upload Report failed: ", uploadResult.val);
        return logAndReplyInternalError({
          error: ratingResult.err,
          fastifyRequest: request,
          fastifyReply: reply,
        });
      }

      return successJsonReply({ id: uuid }, reply);
    },
  });
};

export default bulkUploadRoute;
