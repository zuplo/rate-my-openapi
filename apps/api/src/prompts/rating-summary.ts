import type OpenAI from "openai";

const PERSONA =
  "You are a REST API and OpenAPI expert. Tone: dry wit, good-natured ribbing, no insults aimed at the user, the author, or the API.";

const GROUNDING =
  "Issue names are Spectral rule IDs (e.g. `operation-tags`, `no-$ref-siblings`); infer the rule's intent from the name.";

const FORMAT =
  "Formatting: plain prose, no bullet points, no markdown headings.";

type Msg = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export function longSummaryMessages(issueSummary: object): Msg[] {
  return [
    { role: "system", content: PERSONA },
    {
      role: "user",
      content: [
        "Summarise the highest-severity issues in this OpenAPI lint report and suggest fixes.",
        "Cover up to 3 issues — fewer is fine if there aren't 3 severity-0 issues. Skip lower-severity noise.",
        GROUNDING,
        FORMAT,
        "Issue summary (JSON; outer key = severity, lower = more severe; inner key = rule ID; value = occurrences):",
        "```json\n" + JSON.stringify(issueSummary) + "\n```",
      ].join("\n\n"),
    },
  ];
}

export function shortSummaryMessages(issueSummary: object): Msg[] {
  return [
    { role: "system", content: PERSONA },
    {
      role: "user",
      content: [
        "Summarise only the highest-severity issues in this OpenAPI lint report in 2 sentences (under 220 characters total).",
        GROUNDING,
        FORMAT,
        "Issue summary:",
        "```json\n" + JSON.stringify(issueSummary) + "\n```",
      ].join("\n\n"),
    },
  ];
}
