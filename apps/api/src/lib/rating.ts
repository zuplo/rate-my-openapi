import {
  Rating,
  RatingOutput,
  SpectralReport,
  generateOpenApiRating,
} from "@rate-my-openapi/core";
import spectralCore from "@stoplight/spectral-core";
import SpectralParsers from "@stoplight/spectral-parsers";
import { readFile, unlink } from "fs/promises";
import { load as loadYAML } from "js-yaml";
import { join } from "node:path";
import { Worker } from "node:worker_threads";
import OpenAI from "openai";
import { tmpdir } from "os";
import path from "path";
import { getOpenAIClient } from "../services/openai.js";
import {
  getStorageBucket,
  getStorageBucketName,
  getStorageClient,
} from "../services/storage.js";
import { OpenApiFileExtension, assertValidFileExtension } from "./types.js";
import util from "node:util";
import { exec } from "node:child_process";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

const execAwait = util.promisify(exec);

const { Document } = spectralCore;

export type SimpleReport = Pick<
  Rating,
  | "docsScore"
  | "completenessScore"
  | "score"
  | "securityScore"
  | "sdkGenerationScore"
> & {
  fileExtension: OpenApiFileExtension;
  title: string;
  version: string;
  summary?: string;
};

export interface GetReportResult {
  simpleReport: SimpleReport;
  fullReport: RatingOutput;
}

export class ReportGenerationError extends Error {}

const workerPath = new URL("rating.worker.js", import.meta.url);

export async function runRatingWorker({
  email,
  reportId,
  fileExtension,
}: {
  email: string | undefined;
  reportId: string;
  fileExtension: OpenApiFileExtension;
}): Promise<void> {
  const worker = new Worker(workerPath, {
    workerData: {
      email,
      reportId,
      fileExtension,
    },
    env: process.env,
  });
  return new Promise<void>((resolve, reject) => {
    worker.on("error", (err) => {
      worker.terminate();
      reject(err ?? "Unknown error on worker");
    });
    worker.on("exit", () => {
      resolve();
    });

    setTimeout(() => {
      worker.terminate();
      reject(new Error("Worker timed out."));
    }, 30000);
  });
}

export async function generateRatingFromStorage({
  reportId,
  fileExtension,
}: {
  reportId: string;
  fileExtension: OpenApiFileExtension;
}): Promise<GetReportResult> {
  const fileName = `${reportId}.${fileExtension}`;

  const tempPath = path.join(tmpdir(), fileName);

  try {
    await getStorageBucket().file(fileName).download({
      destination: tempPath,
    });
  } catch (err) {
    throw new ReportGenerationError(`Could not download file from storage`, {
      cause: err,
    });
  }

  const content = await readFile(tempPath, "utf-8");

  const reportResult = await getReport({
    fileContent: content,
    fileExtension: fileExtension,
    reportId,
    openAPIFilePath: tempPath,
  });

  await uploadReport({
    reportId,
    fullReport: reportResult.fullReport,
    simpleReport: reportResult.simpleReport,
  });

  await deleteTempFile(tempPath);

  return reportResult;
}

export async function generateReportFromLocal({
  reportId,
  filePath,
}: {
  reportId: string;
  filePath: OpenApiFileExtension;
}): Promise<GetReportResult> {
  const content = await readFile(filePath, "utf-8");
  const fileExtension = path.extname(filePath).replace(".", "");
  assertValidFileExtension(fileExtension);

  const fileName = `${reportId}.${fileExtension}`;

  await getStorageClient()
    .bucket(getStorageBucketName())
    .file(fileName)
    .save(content);

  const reportResult = await getReport({
    fileContent: content,
    fileExtension: fileExtension as "json" | "yaml",
    reportId,
    openAPIFilePath: filePath,
  });

  await uploadReport({
    reportId,
    ...reportResult,
  });

  return reportResult;
}

async function generateVacuumReport(options: {
  reportId: string;
  openAPIFilePath: string;
}) {
  const rulesetPath = join(process.cwd(), "rulesets/rules.vacuum.yaml");

  let vacuumCliReport;
  try {
    const vacuumCommand =
      `vacuum spectral-report -r ${rulesetPath} -o ${options.openAPIFilePath}`.replace(
        /\n/g,
        "",
      );
    const { stdout, stderr } = await execAwait(vacuumCommand, {
      maxBuffer: undefined,
    });

    if (stderr) {
      throw new ReportGenerationError(
        `Vacuum CLI command failed for report ${options.reportId}`,
        { cause: stderr },
      );
    }

    if (!stdout) {
      throw new ReportGenerationError(
        `Vacuum CLI command succeeded but did not generate a report for report ${options.reportId}`,
      );
    }

    vacuumCliReport = stdout;
  } catch (e) {
    throw new ReportGenerationError(
      `Vacuum CLI command failed for report ${options.reportId}`,
      { cause: e },
    );
  }

  if (!vacuumCliReport) {
    throw new ReportGenerationError(
      `Vacuum CLI command succeeded but did not generate a report for report ${options.reportId}`,
    );
  }

  let outputReport: SpectralReport;
  try {
    outputReport = JSON.parse(vacuumCliReport);
  } catch (err) {
    throw new ReportGenerationError(
      `Could not parse vacuum report for report ${options.reportId}`,
      { cause: err },
    );
  }

  // TODO: being fixed by https://github.com/daveshanley/vacuum/issues/372
  // remove this check once fixed in the next couple of days
  if (vacuumCliReport.toLowerCase().includes("rolodex")) {
    throw new ReportGenerationError(`Rolodex issue ${options.reportId}`);
  }

  return outputReport;
}

async function generateRatingFromReport(options: {
  report: SpectralReport;
  fileContent: string;
  fileExtension: OpenApiFileExtension;
  reportId: string;
}) {
  let outputContent: OpenAPIV3.Document | OpenAPIV3_1.Document;
  try {
    outputContent =
      options.fileExtension === "json"
        ? JSON.parse(options.fileContent)
        : loadYAML(options.fileContent, { json: true });
  } catch (err) {
    throw new ReportGenerationError("Could not parse OpenAPI document", {
      cause: err,
    });
  }

  let output;
  try {
    output = generateOpenApiRating(options.report, outputContent);
  } catch (err) {
    throw new ReportGenerationError(
      `Could not generate rating for report ${options.reportId}`,
      { cause: err },
    );
  }

  return output;
}

async function generateSimpleReport(options: {
  fileContent: string;
  openAPIFilePath: string;
  fileExtension: OpenApiFileExtension;
  ratingOutput: RatingOutput;
}) {
  const parser =
    options.fileExtension === "json"
      ? SpectralParsers.Json
      : SpectralParsers.Yaml;

  let openApiSpectralDoc: spectralCore.Document;
  try {
    openApiSpectralDoc = new Document(
      options.fileContent,
      parser as SpectralParsers.IParser,
      options.openAPIFilePath,
    );
  } catch (err) {
    throw new ReportGenerationError(
      `Unable to parse OpenAPI file ${options.openAPIFilePath}`,
      { cause: err },
    );
  }

  const issueSummary = getReportMinified(options.ratingOutput);
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
    fileExtension: options.fileExtension,
    docsScore: options.ratingOutput.docsScore,
    completenessScore: options.ratingOutput.completenessScore,
    score: options.ratingOutput.score,
    securityScore: options.ratingOutput.securityScore,
    sdkGenerationScore: options.ratingOutput.sdkGenerationScore,
    shortSummary: openAiShortSummary ?? undefined,
    longSummary: openAiLongSummary ?? undefined,
  };

  return simpleReport;
}

export async function getReport(options: {
  fileContent: string;
  reportId: string;
  openAPIFilePath: string;
  fileExtension: OpenApiFileExtension;
}): Promise<GetReportResult> {
  const reportOutput = await generateVacuumReport(options);

  const ratingOutput = await generateRatingFromReport({
    report: reportOutput,
    fileContent: options.fileContent,
    fileExtension: options.fileExtension,
    reportId: options.reportId,
  });

  const simpleReport = await generateSimpleReport({
    fileContent: options.fileContent,
    fileExtension: options.fileExtension,
    openAPIFilePath: options.openAPIFilePath,
    ratingOutput,
  });

  return {
    simpleReport,
    fullReport: ratingOutput,
  };
}

async function uploadReport({
  reportId,
  fullReport,
  simpleReport,
}: {
  reportId: string;
  fullReport: RatingOutput;
  simpleReport: SimpleReport;
}): Promise<void> {
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
}

/**
 * @description produces a stripped down version of the report which can be fed
 * to LLM models.
 */
function getReportMinified(fullReport: RatingOutput) {
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
}

async function getOpenAiResponse(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
): Promise<string | null> {
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
}

async function getOpenAiLongSummary(issueSummary: object) {
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
}

async function getOpenAiShortSummary(issueSummary: object) {
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
}

async function deleteTempFile(tempApiFilePath: string): Promise<void> {
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
}
