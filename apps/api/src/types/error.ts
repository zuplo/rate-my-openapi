import { FastifyReply } from "fastify";

export {};

declare global {
  export type UserErrorResult = {
    userMessage: string;
    debugMessage: string;
    statusCode: number;
    context?: any;
    error?: any;
  };

  export type GenericErrorResult = {
    context?: any;
    error: any;
  };

  export interface ErrorResponse extends FastifyReply {
    constructor: {
      new (res: FastifyReply, error: UserErrorResult): ErrorResponse;
    };
  }
}
