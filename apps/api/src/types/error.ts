import { FastifyReply } from "fastify";

export {};

declare global {
  export type UserErrorResult = {
    userMessage: string;
    debugMessage: string;
    statusCode: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: any;
  };

  export type GenericErrorResult = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any;
  };

  export interface ErrorResponse extends FastifyReply {
    constructor: {
      new (res: FastifyReply, error: UserErrorResult): ErrorResponse;
    };
  }
}
