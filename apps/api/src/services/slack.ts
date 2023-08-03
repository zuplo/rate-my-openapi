import { WebClient } from "@slack/web-api";

const token = process.env.SLACK_TOKEN;

export const slackChannelId = process.env.SLACK_CHANNEL_ID || "";
export const slack = new WebClient(token);
