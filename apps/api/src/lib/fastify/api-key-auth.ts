import { ApiError, Problems } from "@zuplo/errors";
import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyRequest {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: { sub: string; metadata?: any };
  }
  interface FastifyInstance {
    validateApiKey: (request: FastifyRequest) => Promise<void>;
  }
}

const SCHEMA = `bearer `;

export interface ApiKeyPluginOptions {
  validationUrl: string | undefined;
}

interface ApiKeyValidateResponse {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
}

export const apiKeyAuthPlugin: FastifyPluginAsync<ApiKeyPluginOptions> = fp(
  async (fastify: FastifyInstance, options: ApiKeyPluginOptions) => {
    fastify.decorate(
      "validateApiKey",
      async function (request: FastifyRequest): Promise<void> {
        if (!options.validationUrl) {
          throw new ApiError({
            ...Problems.UNAUTHORIZED,
            detail: `API Key authorization is not configured`,
          });
        }

        const { authorization: rawAuthHeader } = request.headers;

        if (!rawAuthHeader) {
          throw new ApiError({
            ...Problems.UNAUTHORIZED,
            detail: `No Authorization Header`,
          });
        }

        if (!rawAuthHeader.toLowerCase().startsWith(SCHEMA)) {
          throw new ApiError({
            ...Problems.UNAUTHORIZED,
            detail: `Invalid Authorization Scheme`,
          });
        }

        const keyValue = rawAuthHeader.substring(SCHEMA.length);

        if (!keyValue || keyValue === "") {
          throw new ApiError({
            ...Problems.UNAUTHORIZED,
            detail: `No key present`,
          });
        }

        const payload = {
          key: keyValue,
        };

        const response = await fetch(options.validationUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.status === 401) {
          request.log.debug(
            "Unauthorized response return from api key service",
          );
          throw new ApiError(Problems.UNAUTHORIZED);
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
