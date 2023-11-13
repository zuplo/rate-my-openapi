import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyRequest {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: { sub: string; metadata: any };
  }
  interface FastifyInstance {
    validateApiKey: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

const SCHEMA = `bearer `;

export interface ApiKeyPluginOptions {
  apiKeyServiceUrl: string;
}

interface ApiKeyValidateResponse {
  id: string;
  name: string;
  metadata: unknown;
}

export const apiKeyAuthPlugin = fp<ApiKeyPluginOptions>(
  async (fastify: FastifyInstance, options) => {
    fastify.decorate(
      "validateApiKey",
      async function (request: FastifyRequest, reply: FastifyReply) {
        const { authorization: rawAuthHeader } = request.headers;

        if (!rawAuthHeader) {
          return reply.status(401).send({ details: `No Authorization Header` });
        }
        console.log(rawAuthHeader);

        if (!rawAuthHeader.toLowerCase().startsWith(SCHEMA)) {
          return reply
            .status(401)
            .send({ details: `Invalid Authorization Scheme` });
        }

        const keyValue = rawAuthHeader.substring(SCHEMA.length);

        if (!keyValue || keyValue === "") {
          return reply.status(401).send({ details: `No key present` });
        }

        const payload = {
          key: keyValue,
        };

        const response = await fetch(options.apiKeyServiceUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (response.status === 401) {
          return reply.status(401).send({ details: "Unauthorized" });
        }

        const data = (await response.json()) as ApiKeyValidateResponse;

        request.user = {
          sub: data.name,
          metadata: data.metadata ?? {},
        };
      },
    );
  },
  {
    name: "api-key-auth",
  },
);
