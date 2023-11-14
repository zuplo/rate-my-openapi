import { config } from "dotenv";
config();

import { randomUUID } from "crypto";
import { execa } from "execa";
import fs from "fs";
import { glob } from "glob";
import PQueue from "p-queue";
import path from "path";
import { createReportFromLocal } from "./dist/lib/local.js";

const baseDir = path.join(process.cwd(), "../../openapi-directory");

const files = await glob(
  "../../openapi-directory/**/{openapi,swagger}.{json,yaml}",
);

const queue = new PQueue({ concurrency: 25 });

const ratingsPath = path.resolve(process.cwd(), "../../apis-guru.json");

const response = await fetch(
  "https://storage.googleapis.com/rate-my-openapi-public/apis-guru.json",
);
let ratings = await response.json();
let updatedRatings = [];

try {
  await queue.addAll(files.map((file) => () => rateFile(file)));
} finally {
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

async function rateFile(file) {
  console.log(`Processing ${file}`);
  const relativeFile = path.relative(baseDir, file);

  const { stdout } = await execa(
    "git",
    ["log", "-1", "--format=%ad", "--", relativeFile],
    { cwd: baseDir },
  );

  const lastModified = new Date(stdout);

  const report = ratings.find((r) => r.file === relativeFile) || {};
  if (
    report.lastModified ? new Date(report.lastModified) >= lastModified : false
  ) {
    console.log(`Skipping ${file} because it hasn't changed`);
    return;
  }

  const reportId = report.reportId || randomUUID();

  const reportResult = await createReportFromLocal(file, reportId);

  report.file = relativeFile;
  report.lastModified = lastModified.toISOString();
  report.reportId = reportId;
  report.score = reportResult.simpleReport.score;

  updatedRatings.push(report);
  console.log(report);
}
