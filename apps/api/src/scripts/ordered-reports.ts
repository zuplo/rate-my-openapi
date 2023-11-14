import { RatingOutput } from "@rate-my-openapi/core";
import { serializeError } from "serialize-error";
import { getStorageBucketName, getStorageClient } from "../services/storage.js";

const regenerateOrderedReport = async (reportId: string) => {
  const fullReportName = reportId + "-report.json";

  const [fullReportExists] = await getStorageClient()
    .bucket(getStorageBucketName())
    .file(fullReportName)
    .exists();

  if (!fullReportExists) {
    console.log(
      `Full report does not exist ${reportId}, skipping simple report creation`,
    );
    return null;
  }

  let fullReport: RatingOutput;
  try {
    const file = await getStorageClient()
      .bucket(getStorageBucketName())
      .file(fullReportName)
      .download();

    fullReport = JSON.parse(file.toString());
  } catch (err) {
    console.error(`Could not download file ${fullReportName}: ${err}`);
    return null;
  }

  const orderedReport: RatingOutput = {
    ...fullReport,
    completenessIssues: fullReport.completenessIssues.sort(
      (a, b) => a.severity - b.severity || a.message.localeCompare(b.message),
    ),
    docsIssues: fullReport.docsIssues.sort(
      (a, b) => a.severity - b.severity || a.message.localeCompare(b.message),
    ),
    sdkGenerationIssues: fullReport.sdkGenerationIssues.sort(
      (a, b) => a.severity - b.severity || a.message.localeCompare(b.message),
    ),
    securityIssues: fullReport.securityIssues.sort(
      (a, b) => a.severity - b.severity || a.message.localeCompare(b.message),
    ),
  };

  try {
    await getStorageClient()
      .bucket(getStorageBucketName())
      .file(fullReportName)
      .save(Buffer.from(JSON.stringify(orderedReport)));
    console.log(`Saved ordered report for file ${fullReportName}`);
  } catch (err) {
    console.error(`Could not save report for file ${fullReportName}`);
    console.error(serializeError(err));
    return null;
  }
};

(async () => {
  const [files] = await getStorageClient()
    .bucket(getStorageBucketName())
    .getFiles();

  const reports = files.filter(
    (file) =>
      file.name.endsWith("-report.json") &&
      !file.name.endsWith("-simple-report.json"),
  );

  for (const report of reports) {
    const reportId = report.name.split("-report.json")[0];
    await regenerateOrderedReport(reportId);
  }
})();

// (async () => {
//   await regenerateOrderedReport("934bc050-9590-4496-9433-73deeec452ff");
// })();
