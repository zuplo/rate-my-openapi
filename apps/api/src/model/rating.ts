import {
  RatingOutput,
  SpectralReport,
  generateOpenApiRating,
} from "@rate-my-openapi/core";
import spectralCore from "@stoplight/spectral-core";
import SpectralParsers from "@stoplight/spectral-parsers";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import { exec } from "child_process";
import esMain from "es-main";
import { unlink, writeFile } from "fs/promises";
import { load as loadYAML } from "js-yaml";
import * as fs from "node:fs";
import { join } from "node:path";
import util from "node:util";
import { getStorageBucketName, storage } from "../services/storage.js";
const { Spectral, Document } = spectralCore;

const execAwait = util.promisify(exec);

export const generateRating = async ({
  id,
  fileExtension,
  email,
}: {
  id: string;
  fileExtension: string;
  email: string;
}) => {
  const fileName = `${id}.${fileExtension}`;
  const file = await storage
    .bucket(getStorageBucketName())
    .file(fileName)
    .download();

  const contentString = file.toString();

  const report = await getReport(contentString, fileName, id);

  if (!report) {
    throw new Error(`Could not generate report for file ${fileName}`);
  }

  await storage
    .bucket(getStorageBucketName())
    .file(`${id}-report.json`)
    .save(Buffer.from(JSON.stringify(report)));

  return {
    email,
    id,
  };
};

const getReport = async (content: string, fileType: string, id: string) => {
  const tempApiFilePath = `/tmp/${id}.${fileType}`;

  try {
    await writeFile(tempApiFilePath, Buffer.from(content));
  } catch (e) {
    console.error(e);
    throw new Error(`Unable to write temporary upload file. File ID: ${id}`);
  }

  const rulesetPath = join(process.cwd(), "rulesets/rules.vacuum.yaml");

  let vacuumCliReport;
  try {
    const { stdout, stderr } = await execAwait(
      `vacuum spectral-report -r ${rulesetPath} -o ${tempApiFilePath}`,
      { maxBuffer: undefined }
    );

    if (stderr) {
      throw new Error(stderr);
    }

    if (!stdout) {
      throw new Error(
        `No output from Vacuum. Confirm the file is not empty. File ID: ${id}`
      );
    }

    vacuumCliReport = stdout;
  } catch (e) {
    throw new Error("Could not execute Vacuum CLI command:" + e);
  }

  if (!vacuumCliReport) {
    throw new Error(
      "Vacuum CLI command succeeded but did not generate a report"
    );
  }

  let spectralOutputReport;
  try {
    const parser =
      fileType === "json" ? SpectralParsers.Json : SpectralParsers.Yaml;

    const openApiSpectralDoc = new Document(
      content,
      parser as SpectralParsers.IParser,
      tempApiFilePath
    );

    const spectral = new Spectral();
    const spectralRulesetFilepath = join(
      process.cwd(),
      "rulesets/.spectral-supplement.yaml"
    );

    try {
      const spectralRuleset = await bundleAndLoadRuleset(
        spectralRulesetFilepath,
        {
          fs,
          fetch,
        }
      );
      spectral.setRuleset(spectralRuleset);
    } catch {
      throw new Error("Unable to set Spectral ruleset");
    }

    spectralOutputReport = await spectral.run(openApiSpectralDoc);
  } catch (e) {
    throw new Error(e || "Could not generate Spectral report");
  }

  const initialOutputReport: SpectralReport = JSON.parse(vacuumCliReport);
  const outputReport = spectralOutputReport
    ? [...initialOutputReport, ...spectralOutputReport]
    : initialOutputReport;

  const outputContent =
    fileType === "json"
      ? JSON.parse(content)
      : loadYAML(content, { json: true });

  const output: RatingOutput = generateOpenApiRating(
    outputReport,
    outputContent
  );

  try {
    unlink(tempApiFilePath);
  } catch (err) {
    throw new Error(`Unable to delete temporary upload file. File ID: ${id}`);
  }

  return output;
};

if (esMain(import.meta)) {
  (async () => {
    const fileId = process.argv[2];
    const fileExtension = process.argv[3];

    if (!fileId || !fileExtension) {
      throw new Error("File ID and file extension are required");
    }

    const result = await generateRating({
      email: "aabedraba@gmail.com",
      id: fileId,
      fileExtension,
    });
    console.log(result);
  })();
}
