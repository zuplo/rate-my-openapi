import { config } from "dotenv";
config();

import { createHash, randomUUID } from "crypto";
import fs from "fs";
import { Worker } from "node:worker_threads";
import { tmpdir } from "os";
/* eslint-env node */
import PQueue from "p-queue";
import path from "path";
import pino from "pino";
import { Readable } from "stream";
import { finished } from "stream/promises";

const outputPath = path.resolve(process.cwd(), "../../apis-guru");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath);
}

const runId = process.env.RUN_ID ?? crypto.randomUUID();

const logPath = path.resolve(outputPath, `${runId}.log`);
const errorLogPath = path.resolve(outputPath, `${runId}-errors.log`);

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

const downloadQueue = new PQueue({ concurrency: 50 });
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

const tempDir = path.join(tmpdir(), randomUUID());
fs.mkdirSync(tempDir);
logger.info(`Downloading APIs to ${tempDir}`);

const apisToUpdate = [];

await downloadQueue.addAll(
  apis.map((api) => async () => {
    const fsPath = path.join(tempDir, `${randomUUID()}.json`);
    const stream = fs.createWriteStream(fsPath, { flags: "wx" });
    const response = await fetch(api.openApiUrl);
    if (response.status !== 200) {
      logger.error(
        `Could not download openapi file for ${api.name} ${api.version}`,
      );
      return;
    }
    await finished(Readable.fromWeb(response.body).pipe(stream));
    api.fsPath = fsPath;

    const content = await fs.promises.readFile(fsPath, "utf-8");
    const hash = Buffer.from(
      createHash("sha256").update(content).digest("hex"),
    ).toString();

    const report =
      ratings.find((r) => r.name === api.name && r.version === api.version) ??
      {};

    if (report.hash !== hash) {
      apisToUpdate.push(api);
    } else {
      logger.debug(`Skipping ${api.name} ${api.version} (no change)`);
    }
  }),
);

logger.info(`Updating ${apisToUpdate.length} APIs`);

queue.onEmpty().then(() => {
  logger.info("Ratings complete");
  process.exit(0);
});

try {
  await queue.addAll(
    apisToUpdate.map((api) => () => {
      return new Promise((resolve) => {
        const report =
          ratings.find(
            (r) => r.name === api.name && r.version === api.version,
          ) ?? {};
        const reportId = report.reportId || randomUUID();

        logger.info(`Processing ${api.name} ${api.version}`);

        const worker = new Worker(workerPath, {
          workerData: {
            ...api,
            logPath,
            report,
            reportId,
          },
          env: process.env,
        });
        worker.on("error", (err) => {
          logger.error(err ?? "Unknown error on worker");
          worker.terminate();
        });
        worker.on("exit", () => {
          resolve();
        });

        setTimeout(() => {
          logger.error("Timeout reached, exiting");
          worker.terminate();
        }, 30000);
      });
    }),
  );
} catch (err) {
  logger.error(err ?? "Unknown error");
}
