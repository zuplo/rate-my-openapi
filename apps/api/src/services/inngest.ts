import { EventSchemas, Inngest } from "inngest";
import { sendFailureEmail, sendReportEmail } from "../lib/email.js";
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

      await step.run("Send Email to user", async () => {
        return await sendFailureEmail({
          email: originalEvent.data.email,
          reportId: originalEvent.data.id,
        });
      });

      await step.run("Send Slack Message", async () => {
        return await slack.chat.postMessage({
          channel: slackChannelId,
          text: `Failed to generate rating for ${originalEvent.data.email} and Report ID ${originalEvent.data.id} with error: ${error.message}`,
        });
      });

      await step.run("Trigger failure event", async () => {
        return await posthog.capture({
          distinctId: originalEvent.data.email,
          properties: {
            reportId: originalEvent.data.id,
          },
          event: "report_generated_failed",
        });
      });
    },
  },
  { event: "api/file.uploaded" },
  async ({ event, step }) => {
    await step.run("Trigger upload event", async () => {
      return await posthog.capture({
        distinctId: event.data.email,
        properties: {
          reportId: event.data.id,
        },
        event: "report_uploaded",
      });
    });

    await step.run("Generate Rating", async () => {
      return await generateRating({
        id: event.data.id,
        fileExtension: event.data.fileExtension,
        email: event.data.email,
      });
    });

    await step.run("Send Email", async () => {
      return await sendReportEmail({
        email: event.data.email,
        reportId: event.data.id,
      });
    });

    await step.run("Generate and cache OG image", async () => {
      const result = await fetch(
        "https://ratemyopenapi.com/api/og/" + event.data.id,
      );
      return {
        status: result.status,
      };
    });

    await step.run("Send Slack Message", async () => {
      return await slack.chat.postMessage({
        channel: slackChannelId,
        text: `Generated rating for ${event.data.email}. Report URL: https://ratemyopenapi.com/report/${event.data.id}`,
      });
    });

    await step.run("Trigger successful event", async () => {
      return await posthog.capture({
        distinctId: event.data.email,
        properties: {
          reportId: event.data.id,
        },
        event: "report_generated_successfully",
      });
    });
  },
);
