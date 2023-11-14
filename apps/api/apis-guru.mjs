import { config } from "dotenv";
config();

import { randomUUID } from "crypto";
import fs from "fs";
import { glob } from "glob";
import { Worker } from "node:worker_threads";
import PQueue from "p-queue";
import path from "path";

const baseDir = path.join(process.cwd(), "../../openapi-directory");

const files = await glob(
  "../../openapi-directory/**/{openapi,swagger}.{json,yaml}",
);

const queue = new PQueue({ concurrency: 10 });

const outputPath = path.resolve(process.cwd(), "../../apis-guru");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath);
}
const ratingsPath = path.resolve(outputPath, "ratings.json");
const logPath = path.resolve(outputPath, `${Date.now()}.log`);

const response = await fetch(
  "https://storage.googleapis.com/rate-my-openapi-public/apis-guru/ratings.json",
  {
    cache: "no-cache",
  },
);
let ratings = await response.json();

const workerPath = path.resolve(process.cwd(), "./api-guru.worker.mjs");

try {
  await queue.addAll(
    files.map((file) => () => {
      return new Promise((resolve, reject) => {
        const relativeFile = path.relative(baseDir, file);
        const report = ratings.find((r) => r.file === relativeFile) ?? {};
        const reportId = report.reportId || randomUUID();

        const worker = new Worker(workerPath, {
          workerData: {
            logPath,
            relativeFile,
            report,
            reportId,
            file,
          },
          env: process.env,
        });
        worker.on("error", (err) => {
          console.error(err ?? "Unknown error on worker");
        });
        worker.on("exit", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject();
          }
        });
        setTimeout(() => {
          worker.terminate();
          reject(new Error("Job timed out"));
        }, 3600 * 1000);
      });
    }),
  );
} catch (err) {
  console.error(err ?? "Unknown error");
} finally {
  console.log("Ratings complete");
  await writeRatings();
  process.exit(0);
}

async function writeRatings() {
  let updatedRatings = [];
  const logLines = await fs.promises.readFile(logPath, "utf-8");
  for (const line of logLines.split("\n")) {
    if (line) {
      const report = JSON.parse(line);
      updatedRatings.push(report);
    }
  }

  const outputRatings = ratings
    .map((r) => {
      const updatedRating = updatedRatings.find((ur) => ur.file === r.file);
      if (updatedRating) {
        return updatedRating;
      }
      return r;
    })
    .filter((r) => r !== undefined);

  // Just to make sure we create fully valid json without undefined values
  const response = new Response(JSON.stringify(outputRatings));
  const result = await response.json();
  const reportJson = JSON.stringify(result, null, 2);
  console.log("Writing rating report");
  await fs.promises.writeFile(ratingsPath, reportJson, "utf-8");
}
