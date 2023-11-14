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

const queue = new PQueue({ concurrency: 10 });

let ratings = [];

const ratingsPath = path.resolve(process.cwd(), "../../apis-guru.json");
if (fs.existsSync(ratingsPath)) {
  ratings = await fs.promises.readFile(ratingsPath, "utf-8").then(JSON.parse);
}

await queue.addAll(files.map((file) => () => rateFile(file)));

const reportJson = JSON.stringify(ratings, null, 2);
await fs.promises.writeFile(ratingsPath, reportJson, "utf-8");

async function rateFile(file) {
  console.log(`Processing ${file}`);

  const { stdout } = await execa(
    "git",
    ["log", "-1", "--format=%ad", "--", path.relative(baseDir, file)],
    { cwd: baseDir },
  );

  const lastModified = new Date(stdout);

  const report =
    ratings.find((r) => r.file === path.relative(baseDir, file)) || {};
  if (
    report.lastModified ? new Date(report.lastModified) >= lastModified : false
  ) {
    console.log(`Skipping ${file} because it hasn't changed`);
    return;
  }

  const reportId = report.reportId || randomUUID();

  await createReportFromLocal(file, reportId);

  report.file = path.relative(baseDir, file);
  report.lastModified = lastModified.toISOString();
  report.reportId = reportId;

  ratings.push(report);

  console.log({ reportId });
}
