import {
  Rating,
  RatingOutput,
  generateOpenApiRating,
} from "@rate-my-openapi/core";
import spectralCore from "@stoplight/spectral-core";
import SpectralParsers from "@stoplight/spectral-parsers";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import { readFile, unlink } from "fs/promises";
import { load as loadYAML } from "js-yaml";
import * as fs from "node:fs";
import { join } from "node:path";
import { Worker } from "node:worker_threads";
import { tmpdir } from "os";
import path from "path";
import { getOpenAiResponse } from "../services/openai-response.js";
import {
  longSummaryMessages,
  shortSummaryMessages,
} from "../prompts/rating-summary.js";
import {
  getStorageBucket,
  getStorageBucketName,
  getStorageClient,
} from "../services/storage.js";
import { ReportGenerationError } from "./errors.js";
import { OpenApiFileExtension, assertValidFileExtension } from "./types.js";

export { ReportGenerationError };

const { Spectral, Document } = spectralCore;

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

export async function getReport(options: {
  fileContent: string;
  reportId: string;
  openAPIFilePath: string;
  fileExtension: OpenApiFileExtension;
}): Promise<GetReportResult> {
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
      `Unable to set Spectral ruleset for file ${options.openAPIFilePath}`,
      { cause: err },
    );
  }

  let spectralOutputReport;
  try {
    spectralOutputReport = await spectral.run(openApiSpectralDoc);
  } catch (err) {
    throw new ReportGenerationError(
      `Unable to run Spectral for file ${options.openAPIFilePath}`,
      { cause: err },
    );
  }

  let output;
  try {
    const outputContent =
      options.fileExtension === "json"
        ? JSON.parse(options.fileContent)
        : loadYAML(options.fileContent, { json: true });

    output = generateOpenApiRating(spectralOutputReport, outputContent);
  } catch (err) {
    throw new ReportGenerationError(err.message, {
      cause: err,
    });
  }

  const issueSummary = getReportMinified(output);
  // Summaries are best-effort: autonomous flow must still publish a score even
  // if OpenAI is down, rate-limited, or returns an error.
  const [openAiLongSummary, openAiShortSummary] = await Promise.all([
    getOpenAiLongSummary(issueSummary).catch((err) => {
      console.warn(`OpenAI long summary failed: ${err}`);
      return null;
    }),
    getOpenAiShortSummary(issueSummary).catch((err) => {
      console.warn(`OpenAI short summary failed: ${err}`);
      return null;
    }),
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

const getOpenAiLongSummary = (issueSummary: object) =>
  getOpenAiResponse({
    messages: longSummaryMessages(issueSummary),
    temperature: 0.3,
    maxTokens: 400,
  });

const getOpenAiShortSummary = (issueSummary: object) =>
  getOpenAiResponse({
    messages: shortSummaryMessages(issueSummary),
    temperature: 0.3,
    maxTokens: 400,
  });

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
