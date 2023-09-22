import {
  Rating,
  RatingOutput,
  SpectralReport,
  generateOpenApiRating,
} from "@rate-my-openapi/core";
import spectralCore from "@stoplight/spectral-core";
import SpectralParsers from "@stoplight/spectral-parsers";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import esMain from "es-main";
import { readFile, unlink, writeFile } from "fs/promises";
import { load as loadYAML } from "js-yaml";
import { exec } from "node:child_process";
import * as fs from "node:fs";
import { join } from "node:path";
import util from "node:util";
import { Err, Ok, Result } from "ts-results-es";
import { getStorageBucketName, storage } from "../services/storage.js";
const { Spectral, Document } = spectralCore;
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const execAwait = util.promisify(exec);

type GenerateRatingInput = {
  reportId: string;
  fileExtension: "json" | "yaml";
};

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

const getOpenAiSummary = async (issueSummary: object) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an expert in REST API Development and know everything about OpenAPI and what makes a good API. You like chatting in a playful, and a somewhat snarky manner. Don't make fun of the user though.",
      },
      {
        role: "user",
        content: `Here's a summary of issues found in an OpenAPI file. The format is a JSON, where the first level indicates the severity of the issue (the lower the key, the more severe), the second level is the name of the issue. These mostly match up to existing spectral rulesets, so you can infer what the issue is. The third level contains the number of occurrences of that issue.\n\nI would like a succinct summary of the issues and advice on how to fix them.  Focus on the most common issues and the highest severity. Keep the tone casual and playful, and a bit snarky. Also, no bullet points. Maximum of 3 issues please. Rank by severity and then occurrences.\n\nHere's the issue summary\n ${JSON.stringify(
          issueSummary,
        )}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 400,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  console.log("response", response);
  return response.choices[0].message.content;
};

export const uploadReport = async ({
  reportId,
  fullReport,
  simpleReport,
}: {
  reportId: string;
  fullReport: RatingOutput;
  simpleReport: SimpleReport;
}): Promise<Result<true, GenericErrorResult>> => {
  try {
    await storage
      .bucket(getStorageBucketName())
      .file(`${reportId}-report.json`)
      .save(Buffer.from(JSON.stringify(fullReport)));

    await storage
      .bucket(getStorageBucketName())
      .file(`${reportId}-simple-report.json`)
      .save(Buffer.from(JSON.stringify(simpleReport)));

    return Ok(true);
  } catch (err) {
    return Err({
      error: `Could not save report for file ${reportId}: ${err}`,
    });
  }
};

export const generateRating = async (
  input: GenerateRatingInput,
): Promise<
  Result<
    {
      simpleReport: SimpleReport;
      fullReport: RatingOutput;
    },
    GenericErrorResult
  >
> => {
  const fileName = `${input.reportId}.${input.fileExtension}`;

  let content;
  try {
    const file = await storage
      .bucket(getStorageBucketName())
      .file(fileName)
      .download();

    content = file.toString();
  } catch (err) {
    return Err({
      error: `Could not download file ${fileName}: ${err}`,
    });
  }

  const tempApiFilePath = await createTempFile({
    fileId: input.reportId,
    fileExtension: input.fileExtension,
    content: content,
  });

  if (tempApiFilePath.err) {
    return tempApiFilePath;
  }

  const reportResult = await getReport({
    fileContent: content,
    fileExtension: input.fileExtension,
    reportId: input.reportId,
    openAPIFilePath: tempApiFilePath.val,
  });

  if (reportResult.err) {
    return reportResult;
  }

  const deleteTempFileResult = await deleteTempFile(tempApiFilePath.val);

  if (deleteTempFileResult.err) {
    return deleteTempFileResult;
  }

  return Ok(reportResult.val);
};

const deleteTempFile = async (
  tempApiFilePath: string,
): Promise<Result<true, GenericErrorResult>> => {
  try {
    await unlink(tempApiFilePath);
    return Ok(true);
  } catch (err) {
    return Err({
      error: `Could not delete temporary file ${tempApiFilePath}: ${err}`,
    });
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
}): Promise<Result<string, GenericErrorResult>> => {
  const tempApiFilePath = `/tmp/${fileId}.${fileExtension}`;

  try {
    await writeFile(tempApiFilePath, Buffer.from(content));
    return Ok(tempApiFilePath);
  } catch (err) {
    return Err({
      error: `Could not create temporary file for file ${fileId}: ${err}`,
    });
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

type GetReportOutput = {
  simpleReport: SimpleReport;
  fullReport: RatingOutput;
};

const getReport = async (
  input: GetReportInput,
): Promise<Result<GetReportOutput, GenericErrorResult>> => {
  const rulesetPath = join(process.cwd(), "rulesets/rules.vacuum.yaml");

  let vacuumCliReport;
  try {
    const vacuumCommand =
      `vacuum spectral-report -r ${rulesetPath} -o ${input.openAPIFilePath}`.replace(
        /\n/g,
        "",
      );
    const { stdout, stderr } = await execAwait(vacuumCommand, {
      maxBuffer: undefined,
    });

    if (stderr) {
      return Err({
        error: `Vacuum CLI command failed for report ${input.reportId}: ${stderr}`,
      });
    }

    if (!stdout) {
      return Err({
        error: `Vacuum CLI command succeeded but did not generate a report for report ${input.reportId}`,
      });
    }

    vacuumCliReport = stdout;
  } catch (e) {
    return Err({
      error: `Vacuum CLI command failed for report ${input.reportId}: ${e}`,
    });
  }

  if (!vacuumCliReport) {
    return Err({
      error: `Vacuum CLI command succeeded but did not generate a report for report ${input.reportId}`,
    });
  }

  let spectralOutputReport;
  let openApiSpectralDoc: spectralCore.Document;
  try {
    const parser =
      input.fileExtension === "json"
        ? SpectralParsers.Json
        : SpectralParsers.Yaml;

    openApiSpectralDoc = new Document(
      input.fileContent,
      parser as SpectralParsers.IParser,
      input.openAPIFilePath,
    );

    const spectral = new Spectral();
    const spectralRulesetFilepath = join(
      process.cwd(),
      "rulesets/.spectral-supplement.yaml",
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
      return Err({
        error: `Unable to set Spectral ruleset for file ${input.openAPIFilePath}: ${err}`,
      });
    }

    spectralOutputReport = await spectral.run(openApiSpectralDoc);
  } catch (err) {
    return Err({
      error: `Unable to run Spectral for file ${input.openAPIFilePath}: ${err}`,
    });
  }

  let output;
  try {
    const initialOutputReport: SpectralReport = JSON.parse(vacuumCliReport);
    const outputReport = spectralOutputReport
      ? [...initialOutputReport, ...spectralOutputReport]
      : initialOutputReport;

    const outputContent =
      input.fileExtension === "json"
        ? JSON.parse(input.fileContent)
        : loadYAML(input.fileContent, { json: true });

    output = generateOpenApiRating(outputReport, outputContent);
  } catch (err) {
    return Err({
      error: `Unable to generate rating for file ${input.reportId}: ${err}`,
    });
  }

  const issueSummary = getReportMinified(output);
  const openAiSummary = await getOpenAiSummary(issueSummary);
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
    summary: openAiSummary ?? undefined,
  };

  return Ok({
    simpleReport,
    fullReport: output,
  });
};

if (esMain(import.meta)) {
  (async () => {
    const jsonOpenApiFilePath = process.argv[2];

    if (!jsonOpenApiFilePath) {
      console.error("Please provide a JSON OpenAPI file path");
      process.exit(1);
    }

    try {
      const path = join(process.cwd(), jsonOpenApiFilePath);
      const file = await readFile(path);
      const content = file.toString();

      const result = await getReport({
        fileContent: content,
        fileExtension: "json",
        reportId: "test",
        openAPIFilePath: path,
      });

      console.log("output: ", result.unwrap().simpleReport);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
