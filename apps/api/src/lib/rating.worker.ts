import { workerData } from "node:worker_threads";
import { createNewLogger } from "../logger.js";
import { sendReportEmail } from "../services/email/index.js";
import { getPostHogClient } from "../services/posthog.js";
import { postSlackMessage } from "../services/slack.js";
import { getSignedUrl } from "../services/storage.js";
import { generateRatingFromStorage } from "./rating.js";
import { RatingWorkerData } from "./types.js";

const { reportId, fileExtension, email, requestId } =
  workerData as RatingWorkerData;

const logger = createNewLogger({
  trace: requestId,
});

const filePath = `${reportId}.${fileExtension}`;

if (email) {
  getPostHogClient()?.capture({
    distinctId: email,
    properties: {
      reportId,
    },
    event: "report_uploaded",
  });
}

logger.debug(`Generating report from storage ${reportId}`);
await generateRatingFromStorage({
  reportId,
  fileExtension,
});

fetch(`https://ratemyopenapi.com/og/${reportId}`).then((response) => {
  if (response.status !== 200) {
    logger.warn(
      `Error generating OpenGraph image cache. Status: ${response.status}`,
    );
  }
});

if (email) {
  logger.debug(`Sending report email for report ${reportId}`);
  await sendReportEmail({
    email,
    reportId,
  });

  const fileUrl = await getSignedUrl(filePath);

  logger.debug(`Sending slack message for report ${reportId}`);
  await postSlackMessage(
    `Generated rating for ${email}. Report URL: https://ratemyopenapi.com/report/${reportId}. ${
      fileUrl ? `File URL: ${fileUrl}` : ""
    }}`,
  );

  getPostHogClient()?.capture({
    distinctId: email,
    properties: {
      reportId,
    },
    event: "report_generated_successfully",
  });
}
