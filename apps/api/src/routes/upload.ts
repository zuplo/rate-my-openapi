import fastifyMultipart from "@fastify/multipart";
import { type FastifyPluginAsync } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { inngestInstance } from "../services/inngest.js";
import { getStorageBucketName, storage } from "../services/storage.js";
import { Result, Ok, Err } from "ts-results-es";
import {
  logAndReplyError,
  logAndReplyInternalError,
  successJsonReply,
} from "../helpers/reply.js";

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
        return logAndReplyError(parseResult.val, request, reply);
      }

      // upload to google cloud storage
      const uuid = uuidv4();
      try {
        const fileContents = Buffer.from(parseResult.val.file).toString();
        const fileName = `${uuid}.${parseResult.val.fileExtension}`;

        await storage
          .bucket(getStorageBucketName())
          .file(fileName)
          .save(fileContents);
      } catch (e) {
        return logAndReplyInternalError(e, request, reply);
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
      } catch (e) {
        return logAndReplyInternalError(e, request, reply);
      }
    },
  });
};

type ParseMultipartUploadResult = {
  file: Buffer;
  email: string;
  fileExtension: string;
};

const parseMultipartUpload = async (
  parts: AsyncIterableIterator<fastifyMultipart.Multipart>,
): Promise<Result<ParseMultipartUploadResult, UserErrorResult>> => {
  let file;
  let email;
  let fileExtensionResult;
  for await (const part of parts) {
    if (part.type === "file" && part.fieldname === "apiFile") {
      file = await part.toBuffer();
      const nonValidatedFileExtension = part.filename.split(".").pop();
      fileExtensionResult = validateFileExtension(nonValidatedFileExtension);
    } else if (part.type === "field" && part.fieldname === "emailAddress") {
      email = part.value as string;
    }
  }

  if (!file || !email || !fileExtensionResult) {
    return Err({
      userMessage: "Invalid request body",
      debugMessage: "Invalid request body",
      statusCode: 400,
    });
  }

  if (fileExtensionResult.err) {
    return fileExtensionResult;
  }

  return Ok({
    file,
    email,
    fileExtension: fileExtensionResult.val,
  });
};

const validateFileExtension = (
  fileExtension: string | undefined,
): Result<"yaml" | "json", UserErrorResult> => {
  switch (fileExtension) {
    case "yaml":
      return Ok("yaml");
    case "json":
      return Ok("json");
    default:
      return Err({
        userMessage: "Invalid file extension",
        debugMessage: "Invalid file extension",
        statusCode: 400,
      });
  }
};

export default uploadRoute;
