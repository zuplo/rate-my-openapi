import { PostHog } from "posthog-node";

export const posthog = PostHogClient();

function PostHogClient() {
  const posthogClient = new PostHog(process.env.POSTHOG_KEY || "", {
    host: process.env.POSTHOG_HOST,
  });
  return posthogClient;
}
