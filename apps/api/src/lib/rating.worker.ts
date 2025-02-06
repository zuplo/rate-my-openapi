import { workerData } from "node:worker_threads";
import { createNewLogger } from "../logger.js";
import { getPostHogClient } from "../services/posthog.js";
import { sendFailureEmail, sendReportEmail } from "../services/sendgrid.js";
import { postSuccessMessage } from "../services/slack.js";
import { GetReportResult, generateRatingFromStorage } from "./rating.js";
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
      email,
    },
    event: "report_uploaded",
  });
}

logger.debug(`Generating report from storage ${reportId}`);
let result: GetReportResult;
try {
  result = await generateRatingFromStorage({
    reportId,
    fileExtension,
  });
  logger.info(`Finished generating report`, {
    score: result.simpleReport.score,
  });
} catch (err) {
  logger.error(err);
  if (email) {
    sendFailureEmail({ email });
  }
  throw err;
}

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
        email,
      },
      event: "report_generated_successfully",
    });
  }
}
