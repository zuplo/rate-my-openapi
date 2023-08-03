import fastifyMultipart from "@fastify/multipart";
import { type FastifyPluginAsync } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { inngestInstance } from "../services/inngest.js";
import { getStorageBucketName, storage } from "../services/storage.js";

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

      if (!parseResult) {
        return reply
          .code(400)
          .header("Content-Type", "application/json; charset=utf-8")
          .send({ message: "Invalid request body" });
      }

      try {
        const uuid = uuidv4();
        const fileContents = Buffer.from(parseResult.file).toString();
        const fileName = `${uuid}.${parseResult.fileExtension}`;

        await storage
          .bucket(getStorageBucketName())
          .file(fileName)
          .save(fileContents);

        await inngestInstance.send({
          name: "api/file.uploaded",
          data: {
            id: uuid,
            email: parseResult.email,
            fileExtension: parseResult.fileExtension,
          },
        });

        return reply
          .code(200)
          .header("Content-Type", "application/json; charset=utf-8")
          .send({ id: uuid });
      } catch (e) {
        throw new Error(e);
      }
    },
  });
};

const parseMultipartUpload = async (
  parts: AsyncIterableIterator<fastifyMultipart.Multipart>
) => {
  let file;
  let email;
  let fileExtension;
  for await (const part of parts) {
    if (part.type === "file" && part.fieldname === "apiFile") {
      file = await part.toBuffer();
      const nonValidatedFileExtension = part.filename.split(".").pop();
      fileExtension = validateFileExtension(nonValidatedFileExtension);
    } else if (part.type === "field" && part.fieldname === "emailAddress") {
      email = part.value as string;
    }
  }

  if (!file || !email || !fileExtension) {
    return null;
  }

  return {
    file,
    email,
    fileExtension,
  };
};

const validateFileExtension = (fileExtension: string | undefined) => {
  switch (fileExtension) {
    case "yaml":
      return "yaml";
    case "json":
      return "json";
    default:
      throw new Error("Invalid file extension");
  }
};

export default uploadRoute;
