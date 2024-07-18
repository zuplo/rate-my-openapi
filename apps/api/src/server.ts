import { config } from "dotenv";
config();

import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    integrations: [new ProfilingIntegration()],
  });
}

import cors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import { randomUUID } from "crypto";
import Fastify from "fastify";
import { errorHandler } from "./lib/fastify/error-handler.js";
import { createNewLogger } from "./logger.js";
import { fileRoute } from "./routes/file.js";
import healthRoute from "./routes/health.js";
import { reportRoute } from "./routes/report.js";
import uploadRoute from "./routes/upload.js";
import { aiFixRoute } from "./routes/ai-fix.js";
import syncReportRoute from "./routes/sync-report.js";

const fastify = Fastify({
  logger: createNewLogger(),
  requestIdHeader: "zp-rid",
  requestIdLogLabel: "trace",
  genReqId: (req) => {
    let rid = req.headers["zp-rid"];
    if (typeof rid !== "string") {
      rid = randomUUID();
    }
    return rid;
  },
  bodyLimit: 30000000, // 50MB
});

async function build() {
  fastify.setErrorHandler(errorHandler);
  await fastify.register(cors);
  await fastify.register(fastifyMultipart);
  await fastify.register(healthRoute);
  await fastify.register(uploadRoute);
  await fastify.register(reportRoute);
  await fastify.register(fileRoute);
  await fastify.register(aiFixRoute);
  await fastify.register(syncReportRoute);
}

const start = async () => {
  try {
    await build();
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    const host = process.env.HOST ?? "localhost";
    await fastify.listen({
      host,
      port,
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  return fastify;
};

start()
  .then((server) => {
    process.on("SIGTERM", () => {
      server.close();
    });
    process.on("SIGINT", () => {
      console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
      // some other closing procedures go here
      process.exit(0);
    });
  })
  .catch(console.error);
