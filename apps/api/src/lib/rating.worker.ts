import { workerData } from "node:worker_threads";
import { createNewLogger } from "../logger.js";
import { sendReportEmail } from "../services/email/index.js";
import { getPostHogClient } from "../services/posthog.js";
import { postSuccessMessage } from "../services/slack.js";
import { generateRatingFromStorage } from "./rating.js";
import { RatingWorkerData } from "./types.js";

const { reportId, fileExtension, email, requestId } =
  workerData as RatingWorkerData;

const logger = createNewLogger({
  trace: requestId,
});

const filePath = `${reportId}.${fileExtension}`;

if (email && process.env.NODE_ENV === "production") {
  getPostHogClient()?.capture({
    distinctId: email,
    properties: {
      reportId,
    },
    event: "report_uploaded",
  });
}

logger.debug(`Generating report from storage ${reportId}`);
const result = await generateRatingFromStorage({
  reportId,
  fileExtension,
});
logger.info(`Finished generating report`, { score: result.simpleReport.score });

fetch(`https://ratemyopenapi.com/og/${reportId}`).then((response) => {
  if (response.status !== 200) {
    logger.warn(
      `Error generating OpenGraph image cache. Status: ${response.status}`,
    );
  }
});

if (email) {
  logger.debug(`Sending report email for report ${reportId}`);
  if (process.env.SENDGRID_API_KEY) {
    await sendReportEmail({
      email,
      reportId,
    });
  } else {
    logger.warn(`Skipping sending email, SENDGRID_API_KEY not set`);
  }

  if (process.env.NODE_ENV === "production") {
    logger.debug(`Sending slack message for report ${reportId}`);
    await postSuccessMessage({
      email,
      reportId,
      openApiFilePath: filePath,
      score: result.simpleReport.score,
    });
  }

  if (process.env.NODE_ENV === "production") {
    getPostHogClient()?.capture({
      distinctId: email,
      properties: {
        reportId,
      },
      event: "report_generated_successfully",
    });
  }
}
