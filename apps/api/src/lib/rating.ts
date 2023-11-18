import {
  Rating,
  RatingOutput,
  generateOpenApiRating,
} from "@rate-my-openapi/core";
import spectralCore from "@stoplight/spectral-core";
import SpectralParsers from "@stoplight/spectral-parsers";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import { unlink, writeFile } from "fs/promises";
import { load as loadYAML } from "js-yaml";
import * as fs from "node:fs";
import { join } from "node:path";
import OpenAI from "openai";
import { getStorageBucketName, getStorageClient } from "../services/storage.js";
const { Spectral, Document } = spectralCore;

let openai: OpenAI | undefined;

type GenerateRatingInput = {
  reportId: string;
  fileExtension: "json" | "yaml";
};

function getOpenAIClient(): OpenAI | undefined {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export class ReportGenerationError extends Error {}

/**
 * @description produces a stripped down version of the report which can be fed
 * to LLM models.
 */
const getReportMinified = (fullReport: RatingOutput) => {
  const issues = fullReport.issues;
  return issues
    .map(({ code, message, severity }) => {
      return { code, message, severity };
    })
    .reduce(
      (groupedIssues, issue) => {
        const { code, severity } = issue;
        if (!groupedIssues[severity]) {
          groupedIssues[severity] = {};
        }
        if (!groupedIssues[severity][code]) {
          groupedIssues[severity][code] = {
            occurrences: 1,
          };
          return groupedIssues;
        }
        groupedIssues[severity][code] = {
          ...groupedIssues[severity][code],
          occurrences: groupedIssues[severity][code].occurrences + 1,
        };
        return groupedIssues;
      },
      {} as Record<number, Record<string, { occurrences: number }>>,
    );
};

const getOpenAiResponse = async (
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
): Promise<string | null> => {
  try {
    const response = await getOpenAIClient()?.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.5,
      max_tokens: 400,
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
};

const getOpenAiLongSummary = async (issueSummary: object) => {
  return await getOpenAiResponse([
    {
      role: "system",
      content:
        "You are an expert in REST API Development and know everything about OpenAPI and what makes a good API. You like chatting in a playful, and a somewhat snarky manner. Don't make fun of the user though.",
    },
    {
      role: "user",
      content: `Here's a summary of issues found in an OpenAPI file. The format is a JSON, where the first level indicates the severity of the issue (the lower the key, the more severe), the second level is the name of the issue. These mostly match up to existing spectral rulesets, so you can infer what the issue is. The third level contains the number of occurrences of that issue.\n\nI would like a succinct summary of the issues and advice on how to fix them.  Focus on the highest severity issues. Keep the tone casual and playful, and a bit snarky. Do not insult the user or API creator or the API. Also, no bullet points. Maximum of 3 issues please. Only talk about the highest severity issues. \n\nHere's the issue summary\n ${JSON.stringify(
        issueSummary,
      )}`,
    },
  ]);
};

const getOpenAiShortSummary = async (issueSummary: object) => {
  return await getOpenAiResponse([
    {
      role: "system",
      content:
        "You are an expert in REST API Development and know everything about OpenAPI and what makes a good API. You like chatting in a playful, and a somewhat snarky manner. Don't make fun of the user though.",
    },
    {
      role: "user",
      content: `Here's a summary of issues found in an OpenAPI file. The format is a JSON, where the first level indicates the severity of the issue (the lower the key, the more severe), the second level is the name of the issue. These mostly match up to existing spectral rulesets, so you can infer what the issue is. The third level contains the number of occurrences of that issue.\n\nI would like a succinct summary of the issues  in 2 lines. Keep the tone casual and playful, and a bit snarky. Do not insult the user or API creator or the API. Also, no bullet points. Only talk about the highest severity issues.\n\nHere's the issue summary\n ${JSON.stringify(
        issueSummary,
      )}`,
    },
  ]);
};

export const uploadReport = async ({
  reportId,
  fullReport,
  simpleReport,
}: {
  reportId: string;
  fullReport: RatingOutput;
  simpleReport: SimpleReport;
}): Promise<void> => {
  try {
    await getStorageClient()
      .bucket(getStorageBucketName())
      .file(`${reportId}-report.json`)
      .save(Buffer.from(JSON.stringify(fullReport)));

    await getStorageClient()
      .bucket(getStorageBucketName())
      .file(`${reportId}-simple-report.json`)
      .save(Buffer.from(JSON.stringify(simpleReport)));
  } catch (err) {
    throw new ReportGenerationError(
      `Could not save report for file ${reportId}`,
      {
        cause: err,
      },
    );
  }
};

export const generateRating = async (
  input: GenerateRatingInput,
): Promise<{
  simpleReport: SimpleReport;
  fullReport: RatingOutput;
}> => {
  const fileName = `${input.reportId}.${input.fileExtension}`;

  let content;
  try {
    const file = await getStorageClient()
      .bucket(getStorageBucketName())
      .file(fileName)
      .download();

    content = file.toString();
  } catch (err) {
    throw new ReportGenerationError(`Could not download file ${fileName}`, {
      cause: err,
    });
  }

  const tempApiFilePath = await createTempFile({
    fileId: input.reportId,
    fileExtension: input.fileExtension,
    content: content,
  });

  const reportResult = await getReport({
    fileContent: content,
    fileExtension: input.fileExtension,
    reportId: input.reportId,
    openAPIFilePath: tempApiFilePath,
  });

  await deleteTempFile(tempApiFilePath);

  return reportResult;
};

const deleteTempFile = async (tempApiFilePath: string): Promise<void> => {
  try {
    await unlink(tempApiFilePath);
  } catch (err) {
    throw new ReportGenerationError(
      `Could not delete temporary file ${tempApiFilePath}`,
      {
        cause: err,
      },
    );
  }
};

export const createTempFile = async ({
  fileId,
  fileExtension,
  content,
}: {
  fileId: string;
  fileExtension: "json" | "yaml";
  content: string;
}): Promise<string> => {
  const tempApiFilePath = `/tmp/${fileId}.${fileExtension}`;

  try {
    await writeFile(tempApiFilePath, Buffer.from(content));
    return tempApiFilePath;
  } catch (err) {
    throw new ReportGenerationError(
      `Could not create temporary file for file ${fileId}`,
      {
        cause: err,
      },
    );
  }
};

type GetReportInput = {
  fileContent: string;
  reportId: string;
  openAPIFilePath: string;
  fileExtension: "json" | "yaml";
};

export type SimpleReport = Pick<
  Rating,
  | "docsScore"
  | "completenessScore"
  | "score"
  | "securityScore"
  | "sdkGenerationScore"
> & {
  fileExtension: "json" | "yaml";
  title: string;
  version: string;
  summary?: string;
};

export interface GetReportOutput {
  simpleReport: SimpleReport;
  fullReport: RatingOutput;
}

export const getReport = async (
  input: GetReportInput,
): Promise<GetReportOutput> => {
  const parser =
    input.fileExtension === "json"
      ? SpectralParsers.Json
      : SpectralParsers.Yaml;

  let openApiSpectralDoc: spectralCore.Document;
  try {
    openApiSpectralDoc = new Document(
      input.fileContent,
      parser as SpectralParsers.IParser,
      input.openAPIFilePath,
    );
  } catch (err) {
    throw new ReportGenerationError(
      `Unable to parse OpenAPI file ${input.openAPIFilePath}`,
      { cause: err },
    );
  }

  const spectral = new Spectral();
  const spectralRulesetFilepath = join(
    process.cwd(),
    "rulesets/.spectral.yaml",
  );

  try {
    const spectralRuleset = await bundleAndLoadRuleset(
      spectralRulesetFilepath,
      {
        fs,
        fetch,
      },
    );
    spectral.setRuleset(spectralRuleset);
  } catch (err) {
    throw new ReportGenerationError(
      `Unable to set Spectral ruleset for file ${input.openAPIFilePath}`,
      { cause: err },
    );
  }

  let spectralOutputReport;
  try {
    spectralOutputReport = await spectral.run(openApiSpectralDoc);
  } catch (err) {
    throw new ReportGenerationError(
      `Unable to run Spectral for file ${input.openAPIFilePath}`,
      { cause: err },
    );
  }

  let output;
  try {
    const outputContent =
      input.fileExtension === "json"
        ? JSON.parse(input.fileContent)
        : loadYAML(input.fileContent, { json: true });

    output = generateOpenApiRating(spectralOutputReport, outputContent);
  } catch (err) {
    throw new ReportGenerationError(err.message, {
      cause: err,
    });
  }

  const issueSummary = getReportMinified(output);
  const [openAiLongSummary, openAiShortSummary] = await Promise.all([
    getOpenAiLongSummary(issueSummary),
    getOpenAiShortSummary(issueSummary),
  ]);

  const simpleReport = {
    version:
      // TODO: Clean this up
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (openApiSpectralDoc.data as any)?.info?.version ||
      // TODO: Clean this up
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (openApiSpectralDoc.data as any)?.openapi ||
      "",
    // TODO: Clean this up
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    title: (openApiSpectralDoc.data as any)?.info?.title || "OpenAPI",
    fileExtension: input.fileExtension,
    docsScore: output.docsScore,
    completenessScore: output.completenessScore,
    score: output.score,
    securityScore: output.securityScore,
    sdkGenerationScore: output.sdkGenerationScore,
    shortSummary: openAiShortSummary ?? undefined,
    longSummary: openAiLongSummary ?? undefined,
  };

  return {
    simpleReport,
    fullReport: output,
  };
};
