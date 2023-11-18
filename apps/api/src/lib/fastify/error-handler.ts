import {
  ApiError,
  HttpStatusCode,
  ProblemDetails,
  Problems,
} from "@zuplo/errors";
import { FastifyReply, FastifyRequest } from "fastify";

export function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  let statusCode = 500;
  let problem: ProblemDetails;

  if (error instanceof ApiError) {
    statusCode = error.status;
    problem = {
      type: error.type,
      title: error.message,
      status: error.status,
      detail: error.detail,
      instance: error.instance,
    };
  } else if (
    typeof error === "object" &&
    "validation" in error &&
    "validationContext" in error
  ) {
    statusCode = HttpStatusCode.BAD_REQUEST;
    problem = {
      ...Problems.BAD_REQUEST,
      // validationContext will be 'body' or 'params' or 'headers' or 'query'
      detail: `An error occurred when validating the ${error.validationContext}.`,
      errors: error.validation,
    };
  } else if (
    typeof error === "object" &&
    "code" in error &&
    error.code === "FST_ERR_NOT_FOUND"
  ) {
    statusCode = 404;
    problem = Problems.NOT_FOUND;
  } else if (
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string" &&
    [
      "FST_ERR_CTP_INVALID_TYPE",
      "FST_ERR_CTP_EMPTY_TYPE",
      "FST_ERR_CTP_BODY_TOO_LARGE",
      "FST_ERR_CTP_INVALID_MEDIA_TYPE",
      "FST_ERR_CTP_INVALID_CONTENT_LENGTH",
      "FST_ERR_CTP_EMPTY_JSON_BODY",
      "FST_ERR_BAD_URL",
      "FST_ERR_INVALID_URL",
    ].includes(error.code)
  ) {
    statusCode = HttpStatusCode.BAD_REQUEST;
    problem = {
      ...Problems.BAD_REQUEST,
      detail: error.message,
    };
  } else {
    let errorStatus: number | undefined;
    if (!reply.statusCode || reply.statusCode === 200) {
      if (
        typeof error === "object" &&
        "statusCode" in error &&
        typeof error.statusCode === "number"
      ) {
        errorStatus = error.statusCode;
      } else if (
        typeof error === "object" &&
        "status" in error &&
        typeof error.status === "number"
      ) {
        errorStatus = error.status;
      }
      statusCode = errorStatus && errorStatus >= 400 ? errorStatus : 500;
    } else {
      statusCode = reply.statusCode;
    }

    problem = getProblemFromStatus(statusCode);

    // If we are not in production, sent the error message
    if (process.env.NODE_ENV !== "production") {
      if (typeof error === "object" && "message" in error) {
        problem.detail = error.message;
      } else if (typeof error === "string") {
        problem.detail = error;
      }
    }
  }

  problem.trace = {
    timestamp: new Date().toJSON(),
    requestId: request.id,
  };

  if (statusCode < 500) {
    reply.log.warn({ res: reply, err: error }, error && error.message);
  } else {
    reply.log.error(
      { req: request, res: reply, err: error },
      error && error.message,
    );
  }

  const body = JSON.stringify(problem, null, 2);
  return reply
    .status(statusCode)
    .header("content-type", "application/json")
    .send(body);
}

function getProblemFromStatus(status: number) {
  if (status === 401) {
    return Problems.UNAUTHORIZED;
  } else if (status === 403) {
    return Problems.FORBIDDEN;
  } else if (status === 404) {
    return Problems.NOT_FOUND;
  } else if (status === 405) {
    return Problems.METHOD_NOT_ALLOWED;
  } else if (status < 500 && status >= 400) {
    return Problems.BAD_REQUEST;
  }
  return Problems.INTERNAL_SERVER_ERROR;
}
