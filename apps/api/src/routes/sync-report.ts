import type { Multipart } from "@fastify/multipart";
import * as Sentry from "@sentry/node";
import { ApiError, Problems } from "@zuplo/errors";
import { randomUUID } from "crypto";
import { type FastifyPluginAsync } from "fastify";
import { assertValidFileExtension } from "../lib/types.js";
import validateOpenapi, {
  checkFileIsJsonOrYaml,
} from "../lib/validate-openapi.js";
import { postSlackMessage } from "../services/slack.js";
import { getStorageBucketName, getStorageClient } from "../services/storage.js";
import { generateRatingFromStorage } from "../lib/rating.js";

const syncReportRoute: FastifyPluginAsync = async function (server) {
  server.route({
    method: "POST",
    // @TODO - will add a schema after agreeing on final format
    url: "/sync-report",
    handler: async (request, reply) => {
      const parts = request.parts();
      let parseResult: ParseMultipartUploadResult;
      try {
        parseResult = await parseMultipartUpload(parts);
      } catch (err) {
        Sentry.captureException(err);
        await postSlackMessage({
          text: `Failed to parse uploaded file with error: ${
            err.detail ?? err.message
          }. Request ID: ${request.id}. ${
            request.headers["api-user"]
              ? `API User: ${request.headers["api-user"]}`
              : ""
          }}`,
        });
        throw err;
      }

      // If not an API key user, error out
      if (!request.headers["api-user"]) {
        throw new ApiError({
          ...Problems.FORBIDDEN,
          detail: "Please provide an api key.",
        });
      }

      const reportId = randomUUID();
      const { fileContentString: content, fileExtension } = parseResult;

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

      const results = await generateRatingFromStorage({
        reportId,
        fileExtension,
      });

      return reply.code(200).send({
        results,
        reportId,
        reportUrl: `https://ratemyopenapi.com/rating/${reportId}`,
      });
    },
  });
};

type ParseMultipartUploadResult = {
  fileContentString: string;
  fileExtension: string;
};

export async function parseMultipartUpload(
  parts: AsyncIterableIterator<Multipart>,
): Promise<ParseMultipartUploadResult> {
  let fileContent;
  for await (const part of parts) {
    if (part.type === "file") {
      fileContent = await part.toBuffer();
    }
  }

  if (!fileContent) {
    throw new ApiError({
      ...Problems.BAD_REQUEST,
      detail: `Invalid request body, no file content.`,
    });
  }
  const fileContentString = fileContent.toString();

  const fileIsJsonOrYamlResult = checkFileIsJsonOrYaml(fileContentString);
  if (typeof fileIsJsonOrYamlResult !== "string") {
    throw new ApiError({
      ...fileIsJsonOrYamlResult,
      detail: `${fileIsJsonOrYamlResult.detail}.`,
    });
  }

  const openApiValidationResult = validateOpenapi({
    fileContent: fileContentString,
    fileExtension: fileIsJsonOrYamlResult,
  });
  if (!openApiValidationResult.isValid) {
    throw new ApiError({
      ...openApiValidationResult.error,
      detail: `${openApiValidationResult.error.detail}. File extension: ${fileIsJsonOrYamlResult}.`,
    });
  }

  return {
    fileContentString,
    fileExtension: fileIsJsonOrYamlResult,
  };
}

export default syncReportRoute;
