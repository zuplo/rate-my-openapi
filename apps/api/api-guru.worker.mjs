import fs from "fs";
import { workerData } from "node:worker_threads";
import pRetry, { AbortError } from "p-retry";
import { createReportFromLocal } from "./dist/lib/local.js";

const { logPath, relativeFile, report, reportId, file } = workerData;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rateFile() {
  console.log(`Processing ${relativeFile} with reportId ${reportId}`);

  const reportResult = await createReportFromLocal(file, reportId, report.hash);

  if (reportResult) {
    report.file = relativeFile;
    report.hash = reportResult.hash;
    report.reportId = reportId;
    report.score = reportResult.simpleReport
      ? isNaN(reportResult.simpleReport.score)
        ? null
        : reportResult.simpleReport.score
      : null;
  } else {
    console.log(`Skipping because it hasn't changed`);
  }
  await writeLogLine(report);
}

async function writeLogLine(report) {
  const logLine = JSON.stringify(report) + "\n";
  await fs.promises.appendFile(logPath, logLine, "utf-8");
}

await pRetry(() => rateFile(), {
  retries: 3,
  randomize: true,
  onFailedAttempt: async (error) => {
    if (error instanceof TypeError) {
      throw new AbortError("Could not rate OpenAPI file");
    }
    console.log("Waiting for 1 second before retrying");
    await sleep(1000);
  },
});

process.exit(0);
