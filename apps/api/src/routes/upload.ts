import { FastifyPluginAsync } from "fastify";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";

import * as GoogleCloudStorage from '@google-cloud/storage';

const storage = new GoogleCloudStorage.Storage({
    projectId: "rate-my-openapi",
  });

const uploadRouteSchema = {
  consumes: ['multipart/form-data'],
  response: {
    default: {
      type: 'object',
      properties: {
        error: {
          type: 'boolean',
          default: false
        },
        success: {
          type: 'boolean',
          default: false
        }
      }
    },
  }
};

const uploadRoute: FastifyPluginAsync = async function (server) {
  server.route({
    method: "POST",
    url: "/upload",
    schema: uploadRouteSchema,
    handler: async (request, reply) => {
      const parts = request.parts();

      let file;
      let email;
      let fileName;
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === "apiFile") {
          fileName = part.filename;
          file = await part.toBuffer();
        } else if (part.type === 'field' && part.fieldname === "email") {
          email = part.value
        }
      }

      if (file && email) {
        const uuid = uuidv4();

        let signedUrl;
        try {
          const [url] = await storage
            .bucket("jonmhutch")
            .file(`${uuid}.json`)
            .getSignedUrl({
              version: 'v4',
              action: 'write',
              expires: Date.now() + 15 * 60 * 1000, // 15 minutes
              contentType: 'application/octet-stream',
            });
          if (url) {
            signedUrl = url;
          }
        } catch (e) {
          throw new Error(e.message);
        }

        if (signedUrl) {
          let fileUploadSuccess = false;
          try {
            const { status } = await axios.put(signedUrl, file, { headers: {'Content-Type': 'application/octet-stream'} });

            if (status === 200) {
              fileUploadSuccess = true;
            }
          } catch (e) {
            throw new Error(e.message);
          }

          if (fileUploadSuccess) {
          }
        }
      } else {
        if (!file && !email) {
          throw new Error('Invalid or missing file and email');
        }
        if (!file) {
          throw new Error('Invalid or missing file');
        }
        if (!email) {
          throw new Error('Invalid or missing email');
        }
      }
      
      reply.send()
    },
  });
};

export default uploadRoute;
