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
import { load } from "js-yaml";

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
        const fileName = `${uuid}.${parseResult.val.fileExtension}`;

        await storage
          .bucket(getStorageBucketName())
          .file(fileName)
          .save(parseResult.val.fileContentString);

        request.log.info(`Uploaded file ${uuid}`);
      } catch (err) {
        return logAndReplyInternalError(err, request, reply);
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
        return logAndReplyInternalError(err, request, reply);
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
  let fileName;
  for await (const part of parts) {
    if (part.type === "file" && part.fieldname === "apiFile") {
      fileContent = await part.toBuffer();
    } else if (part.type === "field" && part.fieldname === "emailAddress") {
      email = part.value as string;
    }
  }

  if (!fileContent || !email) {
    return Err({
      userMessage: "Invalid request body",
      debugMessage: "Invalid request body",
      statusCode: 400,
    });
  }
  const fileContentString = fileContent.toString();
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

const checkFileIsJsonOrYaml = (
  fileContentString: string,
): Result<"yaml" | "json", UserErrorResult> => {
  try {
    JSON.parse(fileContentString);
    return Ok("json");
  } catch (_) {}

  try {
    load(fileContentString);
    return Ok("yaml");
  } catch (err) {}

  return Err({
    userMessage: "Invalid file format",
    debugMessage: "File can only be json or yaml",
    statusCode: 400,
  });
};

export default uploadRoute;
