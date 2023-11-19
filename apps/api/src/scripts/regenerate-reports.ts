import { SimpleReport, generateRatingFromStorage } from "src/lib/rating.js";
import {
  getStorageBucketName,
  getStorageClient,
} from "src/services/storage.js";

const regenerateOrderedReport = async ({
  reportId,
  fileExtension,
}: {
  reportId: string;
  fileExtension: "json" | "yaml";
}) => {
  await generateRatingFromStorage({
    reportId,
    fileExtension,
  });

  console.log(`Regenerated report for ${reportId}`);
};

(async () => {
  const [files] = await getStorageClient()
    .bucket(getStorageBucketName())
    .getFiles();

  const simpleReportFiles = files.filter((file) =>
    file.name.endsWith("-simple-report.json"),
  );

  for (const simpleReportFile of simpleReportFiles) {
    const simpleReportContent = await simpleReportFile.download();
    const simpleReport: SimpleReport = JSON.parse(
      simpleReportContent.toString(),
    );

    await regenerateOrderedReport({
      reportId: simpleReportFile.name.split("-simple-report.json")[0],
      fileExtension: simpleReport.fileExtension,
    });
  }
})();
