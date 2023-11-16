import fs from "fs";
import { workerData } from "node:worker_threads";
import { createReportFromLocal } from "./dist/lib/local.js";

const { logPath, report, reportId, name, version, fsPath } = workerData;

let reportResult = await createReportFromLocal(fsPath, reportId);

report.name = name;
report.version = version;
report.hash = reportResult.hash;
report.reportId = reportId;
report.score = reportResult.simpleReport
  ? isNaN(reportResult.simpleReport.score)
    ? null
    : reportResult.simpleReport.score
  : null;

const logLine = JSON.stringify(report) + "\n";
await fs.promises.appendFile(logPath, logLine, "utf-8");
