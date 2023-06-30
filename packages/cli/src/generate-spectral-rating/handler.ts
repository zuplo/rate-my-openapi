import spectralCore from "@stoplight/spectral-core";
import Parsers from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import spectralRuntime from "@stoplight/spectral-runtime";
import * as fs from "node:fs";
import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { printCriticalFailureToConsoleAndExit } from "../common/output.js";
import { SpectralReport, RatingOutput, generateOpenApiRating } from "@rate-my-openapi/core";

const { Spectral, Document } = spectralCore;
const { fetch } = spectralRuntime;

export interface Arguments {
  filepath: string;
}
export async function generateSpectralRating(argv: Arguments) {
  try {
    const opStartTime = Date.now();
    const filepath = argv.filepath;
    const pathName = join(relative(process.cwd(), filepath));
   
    const openApiFile = await readFile(pathName);
    const openApiSpectralDoc = new Document(
      openApiFile.toString(),
      Parsers.Json,
      filepath
    );
    const openApi = JSON.parse(openApiFile.toString()) as
      | OpenAPIV3_1.Document
      | OpenAPIV3.Document;
    const spectral = new Spectral();
    const rulesetFilepath = join(process.cwd(), "../", "../",  "rulesets", ".spectral.yaml");
    spectral.setRuleset(
      await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch })
    );
    const startTime = Date.now();
    let outputReport: SpectralReport = await spectral.run(openApiSpectralDoc);
    const endTime = Date.now();
    const output: RatingOutput = generateOpenApiRating(outputReport, openApi);
    console.log(JSON.stringify(output, null, 2));
    const opFinishTime = Date.now();
    // Commented out for now so users can write the output as a valid JSON file
    // console.log("Time to run spectral: ", endTime - startTime, "ms");
    // console.log("Time to run operation: ", opFinishTime - opStartTime, "ms");
    process.exit(0);
  } catch (err) {
    printCriticalFailureToConsoleAndExit(err);
  }
}
