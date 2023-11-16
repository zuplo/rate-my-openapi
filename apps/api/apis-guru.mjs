import { config } from "dotenv";
config();

import { randomUUID } from "crypto";
import fs from "fs";
import { Worker } from "node:worker_threads";
import { tmpdir } from "os";
import PQueue from "p-queue";
import path from "path";
import pino from "pino";

const outputPath = path.resolve(process.cwd(), "../../apis-guru");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath);
}

const logPath = path.resolve(outputPath, `${process.env.RUN_ID}.log`);
const errorLogPath = path.resolve(
  outputPath,
  `${process.env.RUN_ID}-errors.log`,
);

const transport = pino.transport({
  targets: [
    {
      target: "pino-pretty",
      level: "info",
      options: {
        colorize: true,
      },
    },
    {
      target: "pino/file",
      level: "error",
      options: { destination: errorLogPath },
    },
  ],
});

const logger = pino(transport);

const apiList = await fetch(
  "https://raw.githubusercontent.com/APIs-guru/openapi-directory/gh-pages/v2/list.json",
).then((response) => response.json());

const queue = new PQueue({ concurrency: 10 });

const ratings = await fetch(
  "https://storage.googleapis.com/rate-my-openapi-public/apis-guru/ratings.json",
  {
    cache: "no-cache",
  },
).then((response) => response.json());

const workerPath = path.resolve(process.cwd(), "./api-guru.worker.mjs");

const apis = [];
Object.keys(apiList).forEach((name) => {
  const api = apiList[name];
  Object.keys(api.versions).forEach((version) => {
    const apiVersion = api.versions[version];
    const openApiUrl = apiVersion.swaggerUrl;
    apis.push({
      name,
      version,
      openApiUrl,
    });
  });
});

try {
  await queue.addAll(
    apis.map((api) => () => {
      return new Promise((resolve, reject) => {
        const report =
          ratings.find(
            (r) => r.name === api.name && r.version === api.version,
          ) ?? {};
        const reportId = report.reportId || randomUUID();

        const worker = new Worker(workerPath, {
          workerData: {
            tempDir: tmpdir(),
            ...api,
            logPath,
            errorLogPath,
            report,
            reportId,
          },
          env: process.env,
        });
        worker.on("message", (message) => {
          const { level, args } = message;
          logger[level](...args);
        });
        worker.on("error", (err) => {
          logger.error(err ?? "Unknown error on worker");
        });
        worker.on("exit", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject();
          }
        });
      });
    }),
  );
} catch (err) {
  logger.error(err ?? "Unknown error");
} finally {
  logger.info("Ratings complete");
  process.exit(0);
}
