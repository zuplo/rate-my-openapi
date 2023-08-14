import { EventSchemas, Inngest } from "inngest";
import { sendFailureEmail, sendReportEmail } from "../lib/email/index.js";
import { generateRating } from "../lib/rating.js";
import { slack, slackChannelId } from "./slack.js";
import { posthog } from "./posthog.js";

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
  name: "Rate My OpenAPI",
  schemas: new EventSchemas().fromRecord<Events>(),
});

export const generateRatingInngest = inngestInstance.createFunction(
  {
    name: "Generate Rating For OpenAPI and Send Email",
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
        try {
          return await slack.chat.postMessage({
            channel: slackChannelId,
            text: `Failed to generate rating for ${originalEvent.data.email} and Report ID ${originalEvent.data.id} with error: ${error.message}`,
          });
        } catch (err) {
          throw new Error("Step Send Failed Slack Message failed: ", err);
        }
      });

      await step.run("Trigger failure event", async () => {
        try {
          return await posthog.capture({
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
        return await posthog.capture({
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
      const result = await generateRating({
        reportId: event.data.id,
        fileExtension: event.data.fileExtension as "json" | "yaml",
        email: event.data.email,
      });

      if (result.err) {
        logger.error("Step Generate Rating failed: ", result.err);
        throw result.err;
      }

      return result.val;
    });

    await step.run("Send Success Email", async () => {
      const result = await sendReportEmail({
        email: event.data.email,
        reportId: event.data.id,
      });

      if (result.err) {
        logger.error("Step Send Success Email: ", result.err);
        throw result.err;
      }

      return result.val;
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
        return await slack.chat.postMessage({
          channel: slackChannelId,
          text: `Generated rating for ${event.data.email}. Report URL: https://ratemyopenapi.com/report/${event.data.id}`,
        });
      } catch (err) {
        logger.error("Step Send Slack Message failed: ", err);
        throw err;
      }
    });

    await step.run("Trigger successful event", async () => {
      try {
        return await posthog.capture({
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
