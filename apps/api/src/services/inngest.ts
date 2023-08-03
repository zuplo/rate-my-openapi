import { EventSchemas, Inngest } from "inngest";
import { sendFailureEmail, sendReportEmail } from "../lib/email.js";
import { generateRating } from "../lib/rating.js";
import { slack, slackChannelId } from "./slack.js";

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

      await step.run("Send Email", async () => {
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
    },
  },
  { event: "api/file.uploaded" },
  async ({ event, step }) => {
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

    await step.run("Send Slack Message", async () => {
      return await slack.chat.postMessage({
        channel: slackChannelId,
        text: `Generated rating for ${event.data.email}. Report URL: https://ratemyopenapi.com/report/${event.data.id}`,
      });
    });
  },
);
