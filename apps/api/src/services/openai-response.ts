import type OpenAI from "openai";
import { ReportGenerationError } from "../lib/errors.js";
import { getOpenAIClient } from "./openai.js";

const MODEL = "gpt-5.4-mini-2026-03-17";

type Params = {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  temperature?: number;
  maxTokens?: number;
};

export async function getOpenAiResponse({
  messages,
  temperature,
  maxTokens,
}: Params): Promise<string | null> {
  try {
    const client = getOpenAIClient();
    if (!client) {
      // No OPENAI_API_KEY configured. Autonomous flow must still publish a
      // score, so return null and let the caller leave the field unset.
      return null;
    }
    const response = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    return response.choices[0].message.content;
  } catch (err) {
    throw new ReportGenerationError(`Could not get OpenAI response: ${err}`, {
      cause: err,
    });
  }
}
