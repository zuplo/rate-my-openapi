import { serializeError } from "serialize-error";
import { SimpleReport, generateRating, uploadReport } from "src/lib/rating.js";
import { getStorageBucketName, storage } from "src/services/storage.js";

const regenerateOrderedReport = async ({
  reportId,
  fileExtension,
}: {
  reportId: string;
  fileExtension: "json" | "yaml";
}) => {
  const generateReportResult = await generateRating({
    reportId,
    fileExtension,
  });

  if (generateReportResult.err) {
    console.error(
      `Could not generate report for ${reportId}: ${serializeError(
        generateReportResult.err,
      )}`,
    );
    throw generateReportResult.err;
  }

  const { simpleReport, fullReport } = generateReportResult.val;

  const uploadReportResult = await uploadReport({
    reportId,
    fullReport,
    simpleReport,
  });

  if (uploadReportResult.err) {
    console.error(
      `Could not upload report for ${reportId}: ${serializeError(
        uploadReportResult.err,
      )}`,
    );
    throw uploadReportResult.err;
  }

  console.log(`Regenerated report for ${reportId}`);
};

(async () => {
  const [files] = await storage.bucket(getStorageBucketName()).getFiles();

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

// (async () => {
//   await regenerateOrderedReport({
//     reportId: "934bc050-9590-4496-9433-73deeec452ff",
//     fileExtension: "json",
//   });
// })();
