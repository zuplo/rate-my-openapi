import { EventSchemas, Inngest, slugify } from "inngest";
import { sendFailureEmail, sendReportEmail } from "../lib/email/index.js";
import { generateRating, uploadReport } from "../lib/rating.js";
import { getPostHogClient } from "./posthog.js";
import { postSlackMessage } from "./slack.js";
import { getStorageBucketName, getStorageClient } from "./storage.js";

type FileUploaded = {
  data: {
    id: string;
    email: string;
    fileExtension: string;
  };
};

type Events = {
  "api/file.uploaded": FileUploaded;
};

export const inngestInstance = new Inngest({
  id: slugify("Rate My OpenAPI"),
  schemas: new EventSchemas().fromRecord<Events>(),
});

const getSignedUrl = async (data: FileUploaded["data"]) => {
  const fileName = `${data.id}.${data.fileExtension}`;
  try {
    const [url] = await getStorageClient()
      .bucket(getStorageBucketName())
      .file(fileName)
      .getSignedUrl({
        action: "read",
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    return url;
  } catch (err) {
    return null;
  }
};

export const generateRatingInngest = inngestInstance.createFunction(
  {
    id: slugify("Generate Rating For OpenAPI and Send Email"),
    onFailure: async ({ error, event, step }) => {
      const originalEvent = event.data.event;

      await step.run("Send Failure Email to user", async () => {
        try {
          return await sendFailureEmail({
            email: originalEvent.data.email,
          });
        } catch (err) {
          throw new Error("Step Send Failure Email to user failed: ", err);
        }
      });

      await step.run("Send Failed Slack Message", async () => {
        const fileUrl = await getSignedUrl(originalEvent.data);
        try {
          return await postSlackMessage(
            `Failed to generate rating for ${
              originalEvent.data.email
            } and Report ID ${originalEvent.data.id} ${
              fileUrl ? `and File URL ${fileUrl}` : ""
            } with error: ${error.message}`,
          );
        } catch (err) {
          throw new Error("Step Send Failed Slack Message failed: ", err);
        }
      });

      await step.run("Trigger failure event", async () => {
        try {
          return getPostHogClient()?.capture({
            distinctId: originalEvent.data.email,
            properties: {
              reportId: originalEvent.data.id,
            },
            event: "report_generated_failed",
          });
        } catch (err) {
          throw new Error("Step Trigger failure event failed: ", err);
        }
      });
    },
  },
  { event: "api/file.uploaded" },
  async ({ event, step, logger }) => {
    await step.run("Trigger upload event", async () => {
      try {
        return getPostHogClient()?.capture({
          distinctId: event.data.email,
          properties: {
            reportId: event.data.id,
          },
          event: "report_uploaded",
        });
      } catch (err) {
        logger.error("Step Trigger upload event failed: ", err);
        throw err;
      }
    });

    await step.run("Generate Rating", async () => {
      const ratingResult = await generateRating({
        reportId: event.data.id,
        fileExtension: event.data.fileExtension as "json" | "yaml",
      });

      const uploadResult = await uploadReport({
        reportId: event.data.id,
        fullReport: ratingResult.fullReport,
        simpleReport: ratingResult.simpleReport,
      });

      return uploadResult;
    });

    await step.run("Send Success Email", async () => {
      const result = await sendReportEmail({
        email: event.data.email,
        reportId: event.data.id,
      });

      return result;
    });

    await step.run("Generate and cache OG image", async () => {
      try {
        const req = await fetch(
          "https://ratemyopenapi.com/api/og/" + event.data.id,
        );

        return {
          status: req.status,
        };
      } catch (err) {
        logger.error("Step Generate and cache OG image failed: ", err);
        throw err;
      }
    });

    await step.run("Send Slack Message", async () => {
      try {
        if (event.data.email.endsWith("@zuplo.com")) {
          return;
        }
        const fileUrl = await getSignedUrl(event.data);
        return await postSlackMessage(
          `Generated rating for ${
            event.data.email
          }. Report URL: https://ratemyopenapi.com/report/${event.data.id}. ${
            fileUrl ? `File URL: ${fileUrl}` : ""
          }}`,
        );
      } catch (err) {
        logger.error("Step Send Slack Message failed: ", err);
        throw err;
      }
    });

    await step.run("Trigger successful event", async () => {
      try {
        return getPostHogClient()?.capture({
          distinctId: event.data.email,
          properties: {
            reportId: event.data.id,
          },
          event: "report_generated_successfully",
        });
      } catch (err) {
        logger.error("Step Trigger successful event failed: ", err);
        throw err;
      }
    });
  },
);
