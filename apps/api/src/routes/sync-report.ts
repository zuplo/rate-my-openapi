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
import { generateRatingFromStorage, getReport } from "../lib/rating.js";
import { tmpdir } from "node:os";
import path from "node:path";
import fs from "node:fs";

const syncReportRoute: FastifyPluginAsync = async function (server) {
  server.route({
    method: "POST",
    /* schema: {
      response: {
        200: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },*/
    url: "/sync-report",
    handler: async (request, reply) => {
      console.log("request received in sync-report");
      const parts = request.parts();
      let parseResult: ParseMultipartUploadResult;
      try {
        parseResult = await parseMultipartUpload(parts);
        console.log("after parsing");
      } catch (err) {
        Sentry.captureException(err);
        /* await postSlackMessage({
          text: `Failed to parse uploaded file with error: ${
            err.detail ?? err.message
          }. Request ID: ${request.id}. ${
            request.headers["api-user"]
              ? `API User: ${request.headers["api-user"]}`
              : ""
          }}`,
        });*/
        throw err;
      }

      // If not an API key user, error out
      /*      if (!request.headers["api-user"]) {
        throw new ApiError({
          ...Problems.BAD_REQUEST,
          detail: "Invalid request body. No api key provided",
        });
      }
*/
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

      // local runs
      const tempPath = path.join(tmpdir(), fileName);

      console.log(`storing file in ${tempPath}`);
      fs.writeFileSync(tempPath, content);

      const results = await getReport({
        fileContent: content,
        fileExtension: fileExtension,
        reportId,
        openAPIFilePath: tempPath,
      });

      /*
      await getStorageClient()
        .bucket(getStorageBucketName())
        .file(fileName)
        .save(content);

      const results = await generateRatingFromStorage({
        reportId,
        fileExtension,
      });
*/

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
      console.log("file to buffer");
      fileContent = await part.toBuffer();
    }
  }

  console.log("fileContent ====");
  if (!fileContent) {
    throw new ApiError({
      ...Problems.BAD_REQUEST,
      detail: `Invalid request body, no file content.`,
    });
  }
  const fileContentString = fileContent.toString();

  console.log(`fileContentString ==> ${fileContentString}`);
  const fileIsJsonOrYamlResult = checkFileIsJsonOrYaml(fileContentString);
  if (typeof fileIsJsonOrYamlResult !== "string") {
    throw new ApiError({
      ...fileIsJsonOrYamlResult,
      detail: `${fileIsJsonOrYamlResult.detail}.`,
    });
  }

  console.log("validate openapi file content");
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
