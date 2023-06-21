import Fastify from "fastify";
import { createNewLogger } from "./logger";
import healthRoute from "./routes/health";

const fastify = Fastify({
  logger: createNewLogger(),
  requestIdHeader: "zp-rid",
  requestIdLogLabel: "trace",
});

async function build() {
  await fastify.register(healthRoute);
}

export const start = async () => {
  try {
    await build();
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
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
