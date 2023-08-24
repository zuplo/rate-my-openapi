import {
  RatingOutput,
  SpectralReport,
  generateOpenApiRating,
} from "@rate-my-openapi/core";
import spectralCore from "@stoplight/spectral-core";
import Parsers, { IParser } from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import spectralRuntime from "@stoplight/spectral-runtime";
import { load } from "js-yaml";
import * as fs from "node:fs";
import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { printCriticalFailureToConsoleAndExit } from "../common/output.js";

const { Spectral, Document } = spectralCore;
const { fetch } = spectralRuntime;

export interface Arguments {
  filepath: string;
  format: string;
}
export async function generateSpectralRating(argv: Arguments) {
  try {
    const filepath = argv.filepath;
    const format = argv.format;
    const pathName = join(relative(process.cwd(), filepath));

    const openApiFile = await readFile(pathName);
    const parser = format === "json" ? Parsers.Json : Parsers.Yaml;
    const openApiSpectralDoc = new Document(
      openApiFile.toString(),
      parser as IParser,
      filepath,
    );
    const outputContent =
      format === "json"
        ? JSON.parse(openApiFile.toString())
        : load(openApiFile.toString(), { json: true });
    const spectral = new Spectral();
    const rulesetFilepath = join(
      process.cwd(),
      "../",
      "../",
      "rulesets",
      ".spectral.yaml",
    );
    spectral.setRuleset(
      await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch }),
    );
    const outputReport: SpectralReport = await spectral.run(openApiSpectralDoc);
    const output: RatingOutput = generateOpenApiRating(
      outputReport,
      outputContent,
    );
    console.log(JSON.stringify(output, null, 2));
    // Commented out for now so users can write the output as a valid JSON file
    // console.log("Time to run spectral: ", endTime - startTime, "ms");
    // console.log("Time to run operation: ", opFinishTime - opStartTime, "ms");
    process.exit(0);
  } catch (err) {
    printCriticalFailureToConsoleAndExit(err);
  }
}
