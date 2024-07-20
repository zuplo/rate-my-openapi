import * as Pino from "pino";

export const logger = Pino.pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    targets: [
      {
        target: "@zuplo/pino-pretty-configurations",
        level: process.env.LOG_LEVEL || "info",
        options: {},
      },
    ],
  },
});
