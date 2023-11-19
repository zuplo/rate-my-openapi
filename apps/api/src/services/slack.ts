import { Block, KnownBlock, WebClient } from "@slack/web-api";

let slack: WebClient | undefined;

export async function postSlackMessage({
  text,
  blocks,
}: {
  text?: string;
  blocks?: (KnownBlock | Block)[];
}) {
  if (!slack && process.env.SLACK_TOKEN) {
    slack = new WebClient(process.env.SLACK_TOKEN);
  }
  const channel = process.env.SLACK_CHANNEL_ID;
  if (!channel) {
    console.warn("No environment variable set for SLACK_CHANNEL_ID");
    return;
  }
  try {
    await slack?.chat.postMessage({
      blocks,
      channel,
      text,
    });
  } catch (err) {
    throw new Error("Failed to send Slack Message", { cause: err });
  }
}

export async function postSuccessMessage({
  email,
  reportId,
  openApiFilePath,
  score,
}: {
  email: string;
  reportId: string;
  openApiFilePath: string;
  score: number;
}) {
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Generated API Rating*",
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Email:*\n${email}`,
        },
        {
          type: "mrkdwn",
          text: `*Scopre:*\n${score}`,
        },
        {
          type: "mrkdwn",
          text: `*Report URL:*\nhttps://ratemyopenapi.com/report/${reportId}`,
        },
        {
          type: "mrkdwn",
          text: `*OpenAPI URL:*\nhttps://api.ratemyopenapi.com/file/${openApiFilePath}`,
        },
      ],
    },
  ];
  return postSlackMessage({ blocks });
}
