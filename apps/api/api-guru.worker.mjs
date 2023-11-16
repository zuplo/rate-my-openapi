import { randomUUID } from "crypto";
import fs from "fs";
import { parentPort, workerData } from "node:worker_threads";
import pRetry, { AbortError } from "p-retry";
import path from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";
import {
  ReportGenerationError,
  createReportFromLocal,
} from "./dist/lib/local.js";

const { logPath, report, reportId, name, version, openApiUrl, tempDir } =
  workerData;

const logger = {
  postMessage(level, args) {
    if (parentPort === null) return;
    parentPort.postMessage({ type: "message", level, args });
  },
  trace: function (...args) {
    this.postMessage("trace", args);
  },
  debug: function (...args) {
    this.postMessage("debug", args);
  },
  info: function (...args) {
    this.postMessage("info", args);
  },
  warn: function (...args) {
    this.postMessage("warn", args);
  },
  error: function (...args) {
    this.postMessage("error", args);
  },
};

setTimeout(() => {
  logger.error("Timeout reached, exiting");
  process.exit(1);
}, 3600 * 1000);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rateFile() {
  const fsPath = path.join(tempDir, `${randomUUID()}.json`);
  const stream = fs.createWriteStream(fsPath, { flags: "wx" });
  const response = await fetch(openApiUrl);
  if (response.status !== 200) {
    throw new Error("Could not download openapi file");
  }
  await finished(Readable.fromWeb(response.body).pipe(stream));

  let reportResult;
  try {
    reportResult = await createReportFromLocal(
      fsPath,
      reportId,
      logger,
      report.hash,
    );
  } catch (err) {
    logger.error(err, `Error processing file`);
    throw err;
  }

  if (reportResult) {
    logger.info(`Processing ${name} ${version}`);
    report.name = name;
    report.version = version;
    report.hash = reportResult.hash;
    report.reportId = reportId;
    report.score = reportResult.simpleReport
      ? isNaN(reportResult.simpleReport.score)
        ? null
        : reportResult.simpleReport.score
      : null;
  } else {
    logger.info(`Skipping ${name} ${version} (no changes)`);
  }
  await writeLogLine(report);
}

async function writeLogLine(report) {
  const logLine = JSON.stringify(report) + "\n";
  await fs.promises.appendFile(logPath, logLine, "utf-8");
}

try {
  await pRetry(() => rateFile(), {
    retries: 3,
    randomize: true,
    onFailedAttempt: async (error) => {
      logger.error(error);
      if (
        error instanceof TypeError ||
        error instanceof ReportGenerationError
      ) {
        throw new AbortError(
          error.message ?? "Unknown error rating OpenAPI file",
        );
      }
      logger.debug("Waiting for 1 second before retrying");
      await sleep(1000);
    },
  });
} catch (err) {
  if (err instanceof AbortError) {
    logger.error("Aborted due to fatal error, no retries.");
  } else {
    logger.error(err);
    throw err;
  }
}

process.exit(0);
