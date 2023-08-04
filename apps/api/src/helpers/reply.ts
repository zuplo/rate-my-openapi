import { FastifyReply, FastifyRequest } from "fastify";

export const logAndReplyError = (
  errorResult: UserErrorResult,
  fastifyRequest: FastifyRequest,
  fastifyReply: FastifyReply,
) => {
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

export const logAndReplyInternalError = (
  error: any,
  fastifyRequest: FastifyRequest,
  fastifyReploy: FastifyReply,
) => {
  return logAndReplyError(
    {
      userMessage: "Internal server error",
      debugMessage: "Internal server error",
      statusCode: 500,
      error,
    },
    fastifyRequest,
    fastifyReploy,
  );
};

export const successJsonReply = (data: object, fastifyReploy: FastifyReply) => {
  return fastifyReploy
    .status(200)
    .header("Content-Type", "application/json; charset=utf-8")
    .send(data);
};
