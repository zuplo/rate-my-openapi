import { FastifyPluginAsync } from "fastify";
import fs from "node:fs/promises";
import path from "node:path";

const healthRoute: FastifyPluginAsync = async function (server) {
  server.route({
    method: "GET",
    url: "/health",
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            health: { type: "string" },
            version: { type: "string" },
            db: { type: "string" },
          },
        },
      },
    },
    handler: async (req, res) => {
      let pkg;
      let health = true;

      try {
        const pkgJson = await fs.readFile(
          path.resolve(process.cwd(), "../../package.json"),
          "utf-8"
        );
        pkg = JSON.parse(pkgJson);
      } catch (e) {
        console.error(e);
        req.log.debug("Failed to get version info in health check");
        health = false;
      }

      return res.code(health ? 200 : 500).send({
        health,
        version: pkg ? pkg.version : "undefined",
      });
    },
  });
};

export default healthRoute;
