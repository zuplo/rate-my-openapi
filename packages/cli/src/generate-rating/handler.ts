import {
  RatingOutput,
  SpectralReport,
  generateOpenApiRating,
} from "@rate-my-openapi/core";
import spectralCore from "@stoplight/spectral-core";
import Parsers from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import spectralRuntime from "@stoplight/spectral-runtime";
import { exec } from "child_process";
import * as fs from "node:fs";
import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import util from "node:util";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { printCriticalFailureToConsoleAndExit } from "../common/output.js";

const { Spectral, Document } = spectralCore;
const { fetch } = spectralRuntime;
const execAwait = util.promisify(exec);
export interface Arguments {
  filepath: string;
}

export async function generateRating(argv: Arguments) {
  try {
    const opStartTime = Date.now();
    const filepath = argv.filepath;
    const pathName = join(relative(process.cwd(), filepath));
    const rulesetPath = join(
      process.cwd(),
      "../",
      "../",
      "rulesets/rules.vacuum.yaml"
    );
    const openApiFile = await readFile(pathName);
    const openApi = JSON.parse(openApiFile.toString()) as
      | OpenAPIV3_1.Document
      | OpenAPIV3.Document;
    const startTime = Date.now();
    const { stdout, stderr } = await execAwait(
      `vacuum spectral-report -r ${rulesetPath} -o ${pathName}`,
      { maxBuffer: undefined }
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
    const openApiSpectralDoc = new Document(
      openApiFile.toString(),
      Parsers.Json,
      filepath
    );
    const spectral = new Spectral();
    const rulesetFilepath = join(
      process.cwd(),
      "../",
      "../",
      "rulesets",
      ".spectral-supplement.yaml"
    );
    spectral.setRuleset(
      await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch })
    );
    const spectralOutputReport: SpectralReport = await spectral.run(
      openApiSpectralDoc
    );
    outputReport = [...outputReport, ...spectralOutputReport];

    const endTime = Date.now();
    const output: RatingOutput = generateOpenApiRating(outputReport, openApi);
    console.log(JSON.stringify(output, null, 2));
    const opFinishTime = Date.now();
    // Commented out for now so users can write the output as a valid JSON file
    // console.log("Time to run Vacuum: ", endTime - startTime, "ms");
    // console.log("Time to run operation: ", opFinishTime - opStartTime, "ms");
    process.exit(0);
  } catch (err) {
    console.log(err);
    printCriticalFailureToConsoleAndExit(err);
  }
}
