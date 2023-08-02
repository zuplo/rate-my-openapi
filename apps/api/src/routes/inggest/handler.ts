import { type FastifyReply, type FastifyRequest } from "fastify";
import { InngestCommHandler, type ServeHandler } from "inngest";

enum headerKeys {
  Signature = "x-inngest-signature",
  SdkVersion = "x-inngest-sdk",
  Environment = "x-inngest-env",
  Platform = "x-inngest-platform",
  Framework = "x-inngest-framework",
}

export enum queryKeys {
  FnId = "fnId",
  StepId = "stepId",
  Introspect = "introspect",
  DeployId = "deployId",
}

type QueryString = {
  [key in queryKeys]: string;
};

type Headers = {
  [key in headerKeys]: string;
};

export const inngestHandler: ServeHandler = (nameOrInngest, fns, opts) => {
  const handler = new InngestCommHandler(
    "fastify",
    nameOrInngest,
    fns,
    opts,
    (
      req: FastifyRequest<{ Querystring: QueryString; Headers: Headers }>,
      _reply: FastifyReply
    ) => {
      const hostname = req.headers["host"];
      const protocol = hostname?.includes("://") ? "" : `${req.protocol}://`;
      const url = new URL(req.url, `${protocol}${hostname || ""}`);

      return {
        url,
        run: () => {
          if (req.method === "POST") {
            return {
              fnId: req.query[queryKeys.FnId] as string,
              stepId: req.query[queryKeys.StepId] as string,
              data: req.body as Record<string, unknown>,
              signature: req.headers[headerKeys.Signature] as string,
            };
          }
        },
        register: () => {
          if (req.method === "PUT") {
            return {
              deployId: req.query[queryKeys.DeployId]?.toString(),
            };
          }
        },
        view: () => {
          if (req.method === "GET") {
            return {
              isIntrospection: Object.hasOwnProperty.call(
                req.query,
                queryKeys.Introspect
              ),
            };
          }
        },
      };
    },
    (actionRes, _req, reply) => {
      for (const [name, value] of Object.entries(actionRes.headers)) {
        reply.header(name, value);
      }
      reply.code(actionRes.status);
      return reply.send(actionRes.body);
    }
  );

  return handler.createHandler();
};
