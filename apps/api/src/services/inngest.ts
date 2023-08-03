import { Inngest } from "inngest";
import { sendReportEmail } from "../lib/email.js";
import { generateRating } from "../lib/rating.js";

export const inngestInstance = new Inngest({ name: "Rate My OpenAPI" });

export const generateRatingInngest = inngestInstance.createFunction(
  { name: "Generate Rating For OpenAPI and Send Email" },
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
  }
);
