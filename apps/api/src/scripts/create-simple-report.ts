import { getStorageBucketName, storage } from "../services/storage.js";
import { SimpleReport } from "../lib/rating.js";
import { load } from "js-yaml";

// at the time of writing this script, I introduced a new simple report format
// that is easier to parse and contains less information than the full report
// this script creates the simple report for all existing full reports
const checkIfSimpleReportExistsAndCreate = async (reportId: string) => {
  const fullReportName = reportId + "-report.json";
  const simpleReportName = reportId + "-simple-report.json";

  const [fullReportExists] = await storage
    .bucket(getStorageBucketName())
    .file(fullReportName)
    .exists();

  if (!fullReportExists) {
    console.log(
      `Full report does not exist ${reportId}, skipping simple report creation`,
    );
    return null;
  }

  const [simpleReportExists] = await storage
    .bucket(getStorageBucketName())
    .file(simpleReportName)
    .exists();

  if (simpleReportExists) {
    console.log(`Simple report already exists ${reportId}, skipping`);
    return null;
  }

  let fullReport;
  try {
    const file = await storage
      .bucket(getStorageBucketName())
      .file(fullReportName)
      .download();

    fullReport = JSON.parse(file.toString());
  } catch (err) {
    console.error(`Could not download file ${fullReportName}: ${err}`);
    return null;
  }

  let openAPIDoc;
  const fileExtension = fullReport?.issues?.[0]?.source?.split(".").pop();
  try {
    const file = await storage
      .bucket(getStorageBucketName())
      .file(reportId + "." + fileExtension)
      .download();

    openAPIDoc =
      fileExtension === "json"
        ? JSON.parse(file.toString())
        : load(file.toString());
  } catch (err) {
    console.error(
      `Could not download or parse file ${reportId}.${fileExtension}: ${err}`,
    );
    return null;
  }

  const simpleReport: SimpleReport = {
    completenessScore: fullReport.completenessScore,
    docsScore: fullReport.docsScore,
    score: fullReport.score,
    sdkGenerationScore: fullReport.sdkGenerationScore,
    securityScore: fullReport.securityScore,
    fileExtension: fileExtension,
    title: openAPIDoc?.info?.title || "OpenAPI",
    version: openAPIDoc?.info?.version || openAPIDoc?.openapi || "",
  };

  try {
    await storage
      .bucket(getStorageBucketName())
      .file(simpleReportName)
      .save(Buffer.from(JSON.stringify(simpleReport)));
  } catch (err) {
    console.error(`Could not save report for file ${simpleReportName}: ${err}`);
    return null;
  }

  console.log(`Simple report created for ${reportId}`);
};

(async () => {
  const [files] = await storage.bucket(getStorageBucketName()).getFiles();

  const reports = files.filter((file) => file.name.endsWith("-report.json"));

  for (const report of reports) {
    const reportId = report.name.split("-report.json")[0];
    await checkIfSimpleReportExistsAndCreate(reportId);
  }
})();
