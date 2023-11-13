import { PostHog } from "posthog-node";

let posthog: PostHog | undefined;

export function getPostHogClient(): PostHog | undefined {
  if (!posthog) {
    if (process.env.POSTHOG_KEY) {
      posthog = new PostHog(process.env.POSTHOG_KEY, {
        host: process.env.POSTHOG_HOST,
      });
    } else {
      console.warn("No environment variable set for POSTHOG_KEY");
    }
  }
  return posthog;
}
