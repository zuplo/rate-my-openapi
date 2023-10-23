import {
  RatingOutput,
  SpectralReport,
  generateOpenApiRating,
} from "@rate-my-openapi/core";
import spectralCore from "@stoplight/spectral-core";
import Parsers, { IParser } from "@stoplight/spectral-parsers";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import spectralRuntime from "@stoplight/spectral-runtime";
import { exec } from "child_process";
import { load } from "js-yaml";
import * as fs from "node:fs";
import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import util from "node:util";
import { printCriticalFailureToConsoleAndExit } from "../common/output.js";

const { Spectral, Document } = spectralCore;
const { fetch } = spectralRuntime;
const execAwait = util.promisify(exec);
export interface Arguments {
  filepath: string;
  format: string;
}

export async function generateRating(argv: Arguments) {
  try {
    const format = argv.format;
    const filepath = argv.filepath;
    const pathName = join(relative(process.cwd(), filepath));
    const rulesetPath = join(
      process.cwd(),
      "../",
      "../",
      "rulesets/rules.vacuum.yaml",
    );
    const openApiFile = await readFile(pathName);
    const { stdout, stderr } = await execAwait(
      `vacuum spectral-report -r ${rulesetPath} -o ${pathName}`,
      { maxBuffer: undefined },
    );

    if (stderr) {
      throw stderr;
    }
    if (!stdout) {
      throw new Error("No output from vacuum. Confirm the file is not empty");
    }
    let outputReport: SpectralReport;
    try {
      outputReport = JSON.parse(stdout);
    } catch (err) {
      throw new Error(`Failed to parse vacuum output to JSON: ${err}`);
    }

    // Spectral supplement
    // There are some issues with Vacuum that need to be resolved before we can
    // solely use it. These spectral rules cover the gaps
    // Issues:
    // - https://github.com/daveshanley/vacuum/issues/303
    // - https://github.com/daveshanley/vacuum/issues/283
    // - https://github.com/daveshanley/vacuum/issues/269
    if (format !== "json" && format !== "yaml") {
      throw new Error(
        `Invalid format: ${format}. Must be either "json" or "yaml"`,
      );
    }

    const parser = format === "json" ? Parsers.Json : Parsers.Yaml;

    const openApiSpectralDoc = new Document(
      openApiFile.toString(),
      parser as IParser,
      filepath,
    );
    const spectral = new Spectral();
    const rulesetFilepath = join(
      process.cwd(),
      "../",
      "../",
      "rulesets",
      ".spectral-supplement.yaml",
    );
    spectral.setRuleset(
      await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch }),
    );
    const spectralOutputReport: SpectralReport =
      await spectral.run(openApiSpectralDoc);
    outputReport = [...outputReport, ...spectralOutputReport];

    const outputContent =
      format === "json"
        ? JSON.parse(openApiFile.toString())
        : load(openApiFile.toString(), { json: true });
    const output: RatingOutput = generateOpenApiRating(
      outputReport,
      outputContent,
    );
    console.log(JSON.stringify(output, null, 2));
    // Commented out for now so users can write the output as a valid JSON file
    // console.log("Time to run Vacuum: ", endTime - startTime, "ms");
    // console.log("Time to run operation: ", opFinishTime - opStartTime, "ms");
    process.exit(0);
  } catch (err) {
    console.log(err);
    printCriticalFailureToConsoleAndExit(err);
  }
}
