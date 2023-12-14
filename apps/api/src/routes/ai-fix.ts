import { type FastifyPluginAsync } from "fastify";
import { getStorageBucket } from "../services/storage.js";
import path from "path";
import { tmpdir } from "os";
import { readFile } from "fs/promises";
import { load } from "js-yaml";
import { getOpenAIClient } from "../services/openai.js";
import OpenAI from "openai";
export class ReportGenerationError extends Error {}

type Issue = {
  code: string | number;
  message: string;
  severity: number;
  path: (string | number)[];
  range: {
    start: {
      line: number;
      character: number;
    };
    end: {
      line: number;
      character: number;
    };
  };
};

async function getOpenAiResponse(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
): Promise<string | null> {
  try {
    const response = await getOpenAIClient()?.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages,
      temperature: 0.5,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    return response
      ? response.choices[0].message.content
      : "Placeholder OpenAI response";
  } catch (err) {
    throw new ReportGenerationError(`Could not get OpenAI response: ${err}`, {
      cause: err,
    });
  }
}

/**
 * Parse out JSON references from a JSON object
 */
function getAllReferences(issueProperty: Record<string, unknown>): string[] {
  const regex = /"\$ref":\s*"(#[^"]+)"/g;
  const issuePropertyString = JSON.stringify(issueProperty);
  let matches: RegExpExecArray | null;
  const extractedRefs: string[] = [];

  while ((matches = regex.exec(issuePropertyString)) !== null) {
    extractedRefs.push(matches[1]);
  }
  return extractedRefs;
}

/**
 * Given a reference and a corpus, resolve it to a value
 */
function resolveAllReferences(
  reference: string,
  openApiSpec: unknown,
): unknown {
  let referenceValue = openApiSpec;
  const references = reference.replace("#/", "").split("/");
  for (const refFragment of references) {
    if (referenceValue == null || typeof referenceValue !== "object") {
      break;
    }
    referenceValue = (referenceValue as Record<string, unknown>)[
      refFragment as string
    ];
  }
  return { reference, referenceValue };
}

export const aiFixRoute: FastifyPluginAsync = async function (server) {
  server.route({
    method: "POST",
    schema: {
      params: {
        type: "object",
        required: ["reportName"],
        properties: {
          reportId: { type: "string" },
        },
      },
      body: {
        type: "object",
        properties: {
          issue: {
            type: "object",
            properties: {
              code: { type: "string" },
              path: { type: "array", items: { type: "string" } },
              severity: { type: "number" },
              source: { type: "string" },
              range: {
                type: "object",
                properties: {
                  start: {
                    type: "object",
                    properties: {
                      line: { type: "number" },
                      character: { type: "number" },
                    },
                  },
                  end: {
                    type: "object",
                    properties: {
                      line: { type: "number" },
                      character: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      response: {
        200: {
          type: "string",
        },
      },
    },
    url: "/ai-fix/:reportName",
    handler: async (request) => {
      const { reportName } = request.params as {
        reportName: string;
        operationId: string;
      };
      const issue = (request.body as { issue: Issue }).issue;

      // Grab the OpenAPI file from storage
      const tempPath = path.join(tmpdir(), reportName);
      try {
        await getStorageBucket().file(reportName).download({
          destination: tempPath,
        });
      } catch (err) {
        throw new ReportGenerationError(
          `Could not download file from storage`,
          {
            cause: err,
          },
        );
      }
      const rawContent = await readFile(tempPath, "utf-8");
      let openApiSpec: unknown;

      // We need to know the file extension to parse the file correctly
      const isJson = reportName.endsWith(".json");
      if (!isJson) {
        try {
          // It's really difficult to operate on a YAML file as a string, so we
          // parse it into a JSON object
          openApiSpec = load(rawContent);
        } catch (err) {
          throw new ReportGenerationError(`Could not parse file from storage`, {
            cause: err,
          });
        }
      } else {
        try {
          openApiSpec = JSON.parse(rawContent);
        } catch (err) {
          throw new ReportGenerationError(`Could not parse file from storage`, {
            cause: err,
          });
        }
      }

      const { path: issuePath } = issue;
      // We want to get the property that the issue is referring to
      let issueProperty = openApiSpec;
      let prevPathFragment = "";
      for (const pathFragment of issuePath) {
        if (issueProperty == null || typeof issueProperty !== "object") {
          break;
        }
        issueProperty = (issueProperty as Record<string, unknown>)[
          pathFragment as string
        ];
        if (prevPathFragment === "paths") {
          // We want the the AI to have the full context of the path
          issueProperty = {
            [pathFragment]: issueProperty,
          };
          break;
        }
        if (prevPathFragment === "components") {
          // We preserve the component name as it is relevant for certain rules
          issueProperty = {
            [pathFragment]: issueProperty,
          };
          break;
        }
        prevPathFragment = pathFragment as string;
      }

      // We parse out the values of all references to give the AI more context
      const references = getAllReferences(
        issueProperty as Record<string, unknown>,
      ).map((ref) => resolveAllReferences(ref, openApiSpec));

      const response = await getOpenAiResponse([
        {
          role: "user",
          content: `Given the following OpenAPI spec sample, and an issue found with that sample, please provide a suggested fix for the issue.\n\n The Sample: ${JSON.stringify(
            issueProperty,
            null,
            2,
          )}\n\n The Issue: ${JSON.stringify(
            issue,
            null,
            2,
          )}. If your suggestion is a change to the OpenAPI spec, the suggestion should be in ${
            isJson ? "JSON" : "YAML"
          } format. Any code blocks should use the markdown codeblock syntax. If the issue has to do with a component being orphaned, you should suggest deleting that component from the spec. Here are some components that are referenced within the OpenAPI spec sample: ${references.join(
            ", ",
          )}
          )}`,
        },
      ]);

      return response;
    },
  });
};
