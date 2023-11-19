import { config } from "dotenv";
config();

import cors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import { randomUUID } from "crypto";
import Fastify from "fastify";
import { errorHandler } from "./lib/fastify/error-handler.js";
import { createNewLogger } from "./logger.js";
import directUploadRoute from "./routes/direct.js";
import { fileRoute } from "./routes/file.js";
import healthRoute from "./routes/health.js";
import { reportRoute } from "./routes/report.js";
import uploadRoute from "./routes/upload.js";

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
  await fastify.register(directUploadRoute);
  await fastify.register(reportRoute);
  await fastify.register(fileRoute);
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
