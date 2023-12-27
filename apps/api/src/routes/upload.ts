import type { Multipart } from "@fastify/multipart";
import * as Sentry from "@sentry/node";
import { ApiError, Problems } from "@zuplo/errors";
import { randomUUID } from "crypto";
import { type FastifyPluginAsync } from "fastify";
import { runRatingWorker } from "../lib/rating.js";
import { assertValidFileExtension } from "../lib/types.js";
import validateOpenapi, {
  checkFileIsJsonOrYaml,
} from "../lib/validate-openapi.js";
import { postSlackMessage } from "../services/slack.js";
import { getStorageBucketName, getStorageClient } from "../services/storage.js";

const uploadRoute: FastifyPluginAsync = async function (server) {
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
    url: "/upload",
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

      // If not an API key user, require an email address
      if (!request.headers["api-user"] && !parseResult.email) {
        throw new ApiError({
          ...Problems.BAD_REQUEST,
          detail: "Invalid request body. No email provided",
        });
      }

      const reportId = randomUUID();
      const { fileContentString: content, fileExtension, email } = parseResult;

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

      runRatingWorker({ reportId, fileExtension, email }).catch((err) => {
        request.log.error(err);
      });

      reply.send({
        reportId,
        reportUrl: `https://ratemyopenapi.com/rating/${reportId}`,
      });
    },
  });
};

type ParseMultipartUploadResult = {
  fileContentString: string;
  email?: string;
  fileExtension: string;
};

export async function parseMultipartUpload(
  parts: AsyncIterableIterator<Multipart>,
): Promise<ParseMultipartUploadResult> {
  let fileContent;
  let email;
  for await (const part of parts) {
    if (part.type === "file" && part.fieldname === "apiFile") {
      fileContent = await part.toBuffer();
    } else if (part.type === "field" && part.fieldname === "emailAddress") {
      email = part.value as string;
    }
  }

  if (!fileContent) {
    throw new ApiError({
      ...Problems.BAD_REQUEST,
      detail: "Invalid request body, no file content",
    });
  }
  const fileContentString = fileContent.toString();

  const fileIsJsonOrYamlResult = checkFileIsJsonOrYaml(fileContentString);

  if (
    !validateOpenapi({
      fileContent: fileContentString,
      fileExtension: fileIsJsonOrYamlResult,
    })
  ) {
    throw new ApiError({
      ...Problems.BAD_REQUEST,
      detail: "Invalid OpenAPI version. Only OpenAPI v3.x is supported.",
    });
  }

  return {
    fileContentString,
    email,
    fileExtension: fileIsJsonOrYamlResult,
  };
}

export default uploadRoute;
