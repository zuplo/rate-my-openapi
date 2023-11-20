import OpenAI from "openai";

let openai: OpenAI | undefined;

export function getOpenAIClient(): OpenAI | undefined {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}
