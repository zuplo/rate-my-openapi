import Fastify from "fastify";
import { createNewLogger } from "./logger";
import healthRoute from "./routes/health";
import uploadRoute from "./routes/upload";
import rateRoute from "./routes/rate";
import fastifyMultipart from "@fastify/multipart";

const fastify = Fastify({
  logger: createNewLogger(),
  requestIdHeader: "zp-rid",
  requestIdLogLabel: "trace",
});

async function build() {
  await fastify.register(fastifyMultipart);
  await fastify.register(healthRoute);
  await fastify.register(uploadRoute);
  await fastify.register(rateRoute);
}

export const start = async () => {
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
