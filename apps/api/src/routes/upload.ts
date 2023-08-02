import axios from "axios";
import { type FastifyPluginAsync } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { getUploadSignedUrl } from "../services/storage.js";

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

      let file;
      let email;
      let fileExt;
      for await (const part of parts) {
        if (part.type === "file" && part.fieldname === "apiFile") {
          file = await part.toBuffer();
          const nonValidatedFileExtension = part.filename.split(".").pop();
          fileExt = validateFileExtension(nonValidatedFileExtension);
        } else if (part.type === "field" && part.fieldname === "emailAddress") {
          email = part.value;
        }
      }

      if (!file || !email || !fileExt) {
        return reply
          .code(400)
          .header("Content-Type", "application/json; charset=utf-8")
          .send({ error: "Request missing required fields" });
      }

      const uuid = uuidv4();
      const signedUrl = await getUploadSignedUrl(`${uuid}.${fileExt}`);

      let fileUploadSuccess = false;
      try {
        const { status } = await axios.put(signedUrl, file, {
          headers: {
            "Content-Type": "application/octet-stream",
          },
        });

        if (status === 200) {
          fileUploadSuccess = true;
        }
      } catch (e) {
        throw new Error(e.response.data);
      }

      if (!fileUploadSuccess) {
        server.log.error(`File upload failed for ${uuid}`);
        return reply
          .code(500)
          .header("Content-Type", "application/json; charset=utf-8")
          .send({ error: "File upload failed" });
      }

      return reply
        .code(200)
        .header("Content-Type", "application/json; charset=utf-8")
        .send({ id: uuid });
    },
  });
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
