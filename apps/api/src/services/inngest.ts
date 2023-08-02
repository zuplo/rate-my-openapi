import { Inngest } from "inngest";
import { generateRating } from "../model/rating.js";

export const inngestInstance = new Inngest({ name: "Rate My OpenAPI" });

export const generateRatingInngest = inngestInstance.createFunction(
  { name: "Generate Rating For OpenAPI" },
  { event: "api/file.uploaded" },
  async ({ event, step }) => {
    await step.run("Generate Rating", async () => {
      return await generateRating({
        id: event.data.id,
        fileExtension: event.data.fileExtension,
        email: event.data.email,
      });
    });
  }
);
