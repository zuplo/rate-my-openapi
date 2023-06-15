import { join, relative } from "node:path";
import { printCriticalFailureToConsoleAndExit } from "../common/output.js";
import { readFile } from "node:fs/promises";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import {
  OperationRating,
  PathRating,
  RatingOutput,
  SpectralReport,
} from "../interfaces.js";
import spectralCore from "@stoplight/spectral-core";
const { Spectral, Document } = spectralCore;
import Parsers from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import spectralRuntime from "@stoplight/spectral-runtime";
import { generateOpenApiRating } from "../utils/rating-utils.js";
const { fetch } = spectralRuntime;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface Arguments {
  filepath: string;
}
export async function generateSpectralRating(argv: Arguments) {
  try {
    const opStartTime = Date.now();
    const filepath = argv.filepath;
    const pathName = join(relative(process.cwd(), filepath));
    const openApiFile = await readFile(
      pathName,
    );
    const openApiSpectralDoc = new Document(
      openApiFile.toString(),
      Parsers.Json,
      filepath,
    );
    const openApi = JSON.parse(openApiFile.toString()) as
      | OpenAPIV3_1.Document
      | OpenAPIV3.Document;
    const spectral = new Spectral();
    const rulesetFilepath = join(__dirname, ".spectral.yaml");

    spectral.setRuleset(
      await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch }),
    );
    const startTime = Date.now();
    let outputReport: SpectralReport = await spectral.run(openApiSpectralDoc);
    const endTime = Date.now();
    const output: RatingOutput = generateOpenApiRating(outputReport, openApi);
    console.log(output);
    const opFinishTime = Date.now();
    console.log("Time to run spectral: ", endTime - startTime, "ms");
    console.log("Time to run operation: ", opFinishTime - opStartTime, "ms");
    process.exit(0);
  } catch (err) {
    printCriticalFailureToConsoleAndExit(err);
  }
}
