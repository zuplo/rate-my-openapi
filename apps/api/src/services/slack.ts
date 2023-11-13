import { WebClient } from "@slack/web-api";

let slack: WebClient | undefined;

export function postSlackMessage(text: string) {
  if (!slack && process.env.SLACK_TOKEN) {
    slack = new WebClient(process.env.SLACK_TOKEN);
  }
  const channel = process.env.SLACK_CHANNEL_ID;
  if (!channel) {
    console.warn("No environment variable set for SLACK_CHANNEL_ID");
    return;
  }
  return slack?.chat.postMessage({
    channel,
    text,
  });
}
