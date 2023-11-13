import fastifyMultipart from "@fastify/multipart";
import { type FastifyPluginAsync } from "fastify";
import { Err, Ok, Result } from "ts-results-es";
import { v4 as uuidv4 } from "uuid";
import {
  logAndReplyError,
  logAndReplyInternalError,
  successJsonReply,
} from "../helpers/reply.js";
import { inngestInstance } from "../services/inngest.js";
import { getStorageBucketName, storage } from "../services/storage.js";
import validateOpenapi, {
  checkFileIsJsonOrYaml,
} from "../lib/validate-openapi.js";
import { slack, slackChannelId } from "../services/slack.js";

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
      const parseResult = await parseMultipartUpload(parts);

      if (parseResult.err) {
        await slack.chat.postMessage({
          channel: slackChannelId,
          text: `Failed to upload file with error: ${parseResult.val.userMessage}. Request ID: ${request.id}`,
        });

        return logAndReplyError({
          errorResult: parseResult.val,
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

      try {
        await inngestInstance.send({
          name: "api/file.uploaded",
          data: {
            id: uuid,
            email: parseResult.val.email,
            fileExtension: parseResult.val.fileExtension,
          },
        });

        return successJsonReply({ id: uuid }, reply);
      } catch (err) {
        return logAndReplyInternalError({
          error: `Could not send event to inngest: ${err}`,
          fastifyRequest: request,
          fastifyReply: reply,
        });
      }
    },
  });
};

type ParseMultipartUploadResult = {
  fileContentString: string;
  email: string;
  fileExtension: string;
};

const parseMultipartUpload = async (
  parts: AsyncIterableIterator<fastifyMultipart.Multipart>,
): Promise<Result<ParseMultipartUploadResult, UserErrorResult>> => {
  let fileContent;
  let email;
  for await (const part of parts) {
    if (part.type === "file" && part.fieldname === "apiFile") {
      fileContent = await part.toBuffer();
    } else if (part.type === "field" && part.fieldname === "emailAddress") {
      email = part.value as string;
    }
  }

  if (!fileContent || !email) {
    return Err({
      userMessage: "Invalid request body.",
      debugMessage: "Invalid request body",
      statusCode: 400,
    });
  }
  const fileContentString = fileContent.toString();
  if (!validateOpenapi(fileContentString)) {
    return Err({
      userMessage: "Invalid OpenAPI version. Only OpenAPI v3.x is supported.",
      debugMessage: "Invalid OpenAPI version",
      statusCode: 400,
    });
  }

  const fileIsJsonOrYamlResult = checkFileIsJsonOrYaml(fileContentString);
  if (fileIsJsonOrYamlResult.err) {
    return fileIsJsonOrYamlResult;
  }

  return Ok({
    fileContentString,
    email,
    fileExtension: fileIsJsonOrYamlResult.val,
  });
};

export default uploadRoute;
