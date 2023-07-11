import { type FastifyPluginAsync } from "fastify";
import { v4 as uuidv4 } from 'uuid';
import * as GoogleCloudStorage from '@google-cloud/storage';
import axios from "axios";

const { GOOGLE_APPLICATION_CREDENTIALS: keyFilename, GOOGLE_CLOUD_STORAGE_BUCKET: bucket } = process.env;

const storage = new GoogleCloudStorage.Storage({
  projectId: "rate-my-openapi",
  keyFilename
});

const uploadRoute: FastifyPluginAsync = async function (server) {
  server.route({
    method: "POST",
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        }
      }
    },
    url: "/upload",
    handler: async (request, reply) => {
      const parts = request.parts();

      let file;
      let email;
      let fileName;
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === "apiFile") {
          fileName = part.filename;
          file = await part.toBuffer();
        } else if (part.type === 'field' && part.fieldname === "emailAddress") {
          email = part.value
        }
      }

      if (file && email && bucket) {
        const uuid = uuidv4();

        let signedUrl;
        
        const [url] = await storage
          .bucket(bucket)
          .file(`${uuid}.json`)
          .getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType: 'application/octet-stream',
          })
          .catch(() => {
            throw new Error('Unable to generate signed URL');
          });

        if (url) {
          signedUrl = url;
        }

        if (signedUrl) {
          const headers = {
            'Content-Type': 'application/octet-stream'
          };
          
          let fileUploadSuccess = false;
          try {
            const { status } = await axios.put(signedUrl, file, { headers });

            if (status === 200) {
              fileUploadSuccess = true;
            }
          } catch (e) {
            throw new Error(e.response.data);
          }

          if (fileUploadSuccess) {
            reply
              .code(200)
              .header('Content-Type', 'application/json; charset=utf-8')
              .send({id: uuid });
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
    },
  });
};

export default uploadRoute;
