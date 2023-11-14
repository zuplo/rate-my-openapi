import { config } from "dotenv";
config();

import { randomUUID } from "crypto";
import fs from "fs";
import { glob } from "glob";
import PQueue from "p-queue";
import pRetry from "p-retry";
import path from "path";
import { createReportFromLocal } from "./dist/lib/local.js";

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const response = await fetch(
  "https://storage.googleapis.com/rate-my-openapi-public/apis-guru/ratings.json",
  {
    cache: "no-cache",
  },
);
let ratings = await response.json();
let updatedRatings = [];

try {
  await queue.addAll(
    files.map((file) => () => {
      return pRetry(() => rateFile(file), {
        retries: 3,
        randomize: true,
        onFailedAttempt: async (error) => {
          console.log("Waiting for 1 second before retrying");
          await sleep(1000);
        },
      });
    }),
  );
} catch (err) {
  console.error(err);
} finally {
  await writeRatings();
}

async function rateFile(file) {
  const relativeFile = path.relative(baseDir, file);
  console.log(`Processing ${relativeFile}`);

  const report = ratings.find((r) => r.file === relativeFile) || {};
  const reportId = report.reportId || randomUUID();

  const reportResult = await createReportFromLocal(
    file,
    reportId,
    report?.hash,
  );

  report.file = relativeFile;
  report.hash = reportResult.hash;
  report.reportId = reportId;
  report.score = reportResult.simpleReport
    ? isNaN(reportResult.simpleReport.score)
      ? undefined
      : reportResult.simpleReport.score
    : undefined;

  updatedRatings.push(report);
  await writeLogLine(report);
  console.log(report);
}

async function writeLogLine(report) {
  const logLine = JSON.stringify(report) + "\n";
  await fs.promises.appendFile(logPath, logLine, "utf-8");
}

async function writeRatings() {
  const outputRatings = ratings.map((r) => {
    const updatedRating = updatedRatings.find((ur) => ur.file === r.file);
    if (updatedRating) {
      return updatedRating;
    }
    return r;
  });

  const reportJson = JSON.stringify(outputRatings, null, 2);
  await fs.promises.writeFile(ratingsPath, reportJson, "utf-8");
}
