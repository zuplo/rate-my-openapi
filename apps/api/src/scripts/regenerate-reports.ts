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
  console.time("ExecutionTime");
  try {
    const [files] = await getStorageClient()
      .bucket(getStorageBucketName())
      .getFiles();

    const simpleReportFiles = files.filter((file) =>
      file.name.endsWith("-simple-report.json"),
    );

    for (const simpleReportFile of simpleReportFiles) {
      let downloadedFileContent: DownloadResponse;

      try {
        downloadedFileContent = await simpleReportFile.download();
      } catch (err) {
        console.error(`Could not download file ${simpleReportFile.name}`, err);
        continue;
      }

      const simpleReport: SimpleReport = JSON.parse(
        downloadedFileContent.toString(),
      );

      const reportId = simpleReportFile.name.split("-simple-report.json")[0];
      console.log(`Regenerating report for ${reportId}`);

      const fileExtension = simpleReport.fileExtension;

      const fileName = `${reportId}.${fileExtension}`;

      const tempPath = path.join(tmpdir(), fileName);

      try {
        await getStorageBucket().file(fileName).download({
          destination: tempPath,
        });
      } catch (err) {
        throw new ReportGenerationError(
          `Could not download file from storage`,
          {
            cause: err,
          },
        );
      }

      const content = await readFile(tempPath, "utf-8");

      console.time("ReportTime");
      try {
        const reportResult = await getReport({
          fileContent: content,
          fileExtension: fileExtension,
          reportId,
          openAPIFilePath: tempPath,
        });

        console.log(
          `Regenerated report for ${reportResult.simpleReport.title}`,
        );
      } catch (err) {
        console.error(`Could not generate report for ${reportId}`, err);
      }
      console.timeEnd("ReportTime");
    }
  } catch (err) {
    console.error(`Could not regenerate reports`);
    console.error(err);
  }
  console.timeEnd("ExecutionTime");
})();
