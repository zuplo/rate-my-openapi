import {
  RatingOutput,
  SpectralReport,
  generateOpenApiRating,
} from "@rate-my-openapi/core";
import spectralCore from "@stoplight/spectral-core";
import SpectralParsers from "@stoplight/spectral-parsers";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import esMain from "es-main";
import { unlink, writeFile } from "fs/promises";
import { load as loadYAML } from "js-yaml";
import { exec } from "node:child_process";
import * as fs from "node:fs";
import { join } from "node:path";
import util from "node:util";
import { getStorageBucketName, storage } from "../services/storage.js";
import { Err, Ok, Result } from "ts-results-es";
const { Spectral, Document } = spectralCore;

const execAwait = util.promisify(exec);

type GenerateRatingInput = {
  id: string;
  fileExtension: string;
  email: string;
};

export const generateRating = async (
  input: GenerateRatingInput,
): Promise<Result<true, GenericErrorResult>> => {
  const fileName = `${input.id}.${input.fileExtension}`;

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

  const reportResult = await getReport({
    content: content,
    fileExtension: input.fileExtension,
    id: input.id,
  });

  if (reportResult.err) {
    return reportResult;
  }

  try {
    await storage
      .bucket(getStorageBucketName())
      .file(`${input.id}-report.json`)
      .save(Buffer.from(JSON.stringify(reportResult.val)));

    return Ok(true);
  } catch (err) {
    return Err({
      error: `Could not save report for file ${fileName}: ${err}`,
    });
  }
};

type GetReportInput = {
  id: string;
  fileExtension: string;
  content: string;
};

const getReport = async (
  input: GetReportInput,
): Promise<Result<RatingOutput, GenericErrorResult>> => {
  const tempApiFilePath = `/tmp/${input.id}.${input.fileExtension}`;

  try {
    await writeFile(tempApiFilePath, Buffer.from(input.content));
  } catch (err) {
    return Err({
      error: `Could not write temporary file for file ${input.id}`,
      err,
    });
  }

  const rulesetPath = join(process.cwd(), "rulesets/rules.vacuum.yaml");

  let vacuumCliReport;
  try {
    const vacuumCommand =
      `vacuum spectral-report -r ${rulesetPath} -o ${tempApiFilePath}`.replace(
        /\n/g,
        "",
      );
    const { stdout, stderr } = await execAwait(vacuumCommand, {
      maxBuffer: undefined,
    });

    if (stderr) {
      return Err({
        error: `Vacuum CLI command failed for file ${input.id}: ${stderr}`,
      });
    }

    if (!stdout) {
      return Err({
        error: `Vacuum CLI command succeeded but did not generate a report for file ${input.id}`,
      });
    }

    vacuumCliReport = stdout;
  } catch (e) {
    return Err({
      error: `Vacuum CLI command failed for file ${input.id}: ${e}`,
    });
  }

  if (!vacuumCliReport) {
    return Err({
      error: `Vacuum CLI command succeeded but did not generate a report for file ${input.id}`,
    });
  }

  let spectralOutputReport;
  try {
    const parser =
      input.fileExtension === "json"
        ? SpectralParsers.Json
        : SpectralParsers.Yaml;

    const openApiSpectralDoc = new Document(
      input.content,
      parser as SpectralParsers.IParser,
      tempApiFilePath,
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
        error: `Unable to set Spectral ruleset for file ${input.id}: ${err}`,
      });
    }

    spectralOutputReport = await spectral.run(openApiSpectralDoc);
  } catch (err) {
    return Err({
      error: `Unable to run Spectral for file ${input.id}: ${err}`,
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
        ? JSON.parse(input.content)
        : loadYAML(input.content, { json: true });

    output = generateOpenApiRating(outputReport, outputContent);
  } catch (err) {
    return Err({
      error: `Unable to generate rating for file ${input.id}: ${err}`,
    });
  }

  try {
    unlink(tempApiFilePath);
  } catch (err) {
    return Err({
      error: `Unable to delete temporary file for file ${input.id}: ${err}`,
    });
  }

  return Ok(output);
};

if (esMain(import.meta)) {
  (async () => {
    const fileId = process.argv[2];
    const fileExtension = process.argv[3];

    if (!fileId || !fileExtension) {
      throw new Error("File ID and file extension are required");
    }

    try {
      const result = await generateRating({
        email: "aabedraba@gmail.com",
        id: fileId,
        fileExtension,
      });

      console.log(result.unwrap());
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
