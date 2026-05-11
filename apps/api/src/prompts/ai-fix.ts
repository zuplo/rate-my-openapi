import type OpenAI from "openai";

type Msg = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export function aiFixMessages(opts: {
  sample: unknown;
  issue: unknown;
  references: string;
  format: "JSON" | "YAML";
}): Msg[] {
  return [
    {
      role: "user",
      content: [
        "You are reviewing an OpenAPI spec fragment and a single lint issue flagged against it.",
        "Suggest a fix. Rules:",
        `- If your fix changes the spec, output it in ${opts.format} inside a fenced code block.`,
        "- Leave inline comments explaining the change.",
        "- Structural/cleanup issues (orphans, unused components, dead refs) → suggest removal.",
        "- Missing-data issues (absent fields, undocumented behaviour) → suggest addition.",
        "- If the right fix isn't clear from the sample, say so explicitly rather than guessing.",
        "",
        "<openapi_sample>",
        JSON.stringify(opts.sample, null, 2),
        "</openapi_sample>",
        "",
        "<issue>",
        JSON.stringify(opts.issue, null, 2),
        "</issue>",
        "",
        "<references>",
        opts.references || "none",
        "</references>",
      ].join("\n"),
    },
  ];
}
