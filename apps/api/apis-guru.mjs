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

await queue.addAll(files.map((file) => () => rateFile(file)));

async function rateFile(file) {
  console.log(`Processing ${file}`);

  const { stdout } = await execa(
    "git",
    ["log", "-1", "--format=%ad", "--", path.relative(baseDir, file)],
    { cwd: baseDir },
  );

  const lastModified = new Date(stdout);

  const reportPath = path.resolve(file, "../rating.json");

  let report;
  if (fs.existsSync(reportPath)) {
    report = await fs.promises.readFile(reportPath, "utf-8").then(JSON.parse);
  } else {
    report = {};
  }

  if (
    report.lastModified ? new Date(report.lastModified) >= lastModified : false
  ) {
    console.log(`Skipping ${file} because it hasn't changed`);
    return;
  }

  const reportId = report.reportId || randomUUID();

  await createReportFromLocal(file, reportId);

  report.lastModified = lastModified.toISOString();
  report.reportId = reportId;

  const reportJson = JSON.stringify(report, null, 2);
  await fs.promises.writeFile(reportPath, reportJson);

  console.log({ reportId });
}
