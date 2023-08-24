import { FastifyReply, FastifyRequest } from "fastify";

export const logAndReplyError = ({
  errorResult,
  fastifyRequest,
  fastifyReply,
}: {
  errorResult: UserErrorResult;
  fastifyRequest: FastifyRequest;
  fastifyReply: FastifyReply;
}) => {
  fastifyRequest.log.error(errorResult.debugMessage, {
    error: errorResult.error,
    context: errorResult.context,
    requestId: fastifyRequest.id,
  });

  return fastifyReply
    .status(errorResult.statusCode)
    .header("Content-Type", "application/json; charset=utf-8")
    .send({
      userMessage: errorResult.userMessage,
    });
};

export const logAndReplyInternalError = ({
  error,
  fastifyRequest,
  fastifyReply,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  fastifyRequest: FastifyRequest;
  fastifyReply: FastifyReply;
}) => {
  return logAndReplyError({
    errorResult: {
      userMessage: "Internal server error",
      debugMessage: "Internal server error",
      statusCode: 500,
      error,
    },
    fastifyRequest,
    fastifyReply,
  });
};

export const successJsonReply = (data: object, fastifyReploy: FastifyReply) => {
  return fastifyReploy
    .status(200)
    .header("Content-Type", "application/json; charset=utf-8")
    .send(data);
};
