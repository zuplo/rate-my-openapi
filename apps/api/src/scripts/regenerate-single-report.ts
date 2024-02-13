import {
  ReportGenerationError,
  SimpleReport,
  getReport,
} from "../lib/rating.js";
import { getStorageBucketName, getStorageClient } from "../services/storage.js";
import { readFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { getStorageBucket } from "../services/storage.js";
import { DownloadResponse } from "@google-cloud/storage";

(async () => {
  const reportName = "0a7ba2cf-6c1a-4c8c-a71a-36384ae72ac1-simple-report.json";

  let downloadedFileContent: DownloadResponse;
  try {
    downloadedFileContent = await getStorageClient()
      .bucket(getStorageBucketName())
      .file(reportName)
      .download();
  } catch (err) {
    console.error(`Could not download file ${reportName}`, err);
    return;
  }

  const simpleReport: SimpleReport = JSON.parse(
    downloadedFileContent.toString(),
  );

  const reportId = reportName.split("-simple-report.json")[0];
  console.log(`Regenerating report for ${reportId}`);

  const fileExtension = simpleReport.fileExtension;

  const fileName = `${reportId}.${fileExtension}`;

  const tempPath = path.join(tmpdir(), fileName);

  try {
    await getStorageBucket().file(fileName).download({
      destination: tempPath,
    });
  } catch (err) {
    throw new ReportGenerationError(`Could not download file from storage`, {
      cause: err,
    });
  }

  const content = await readFile(tempPath, "utf-8");

  try {
    const reportResult = await getReport({
      fileContent: content,
      fileExtension: fileExtension,
      reportId,
      openAPIFilePath: tempPath,
    });

    console.log(`Regenerated report for ${reportResult.simpleReport.title}`);
  } catch (err) {
    console.error(`Could not generate report for ${reportId}`, err);
  }
})();
