import { exec } from "child_process";
import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import util from "node:util";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { printCriticalFailureToConsoleAndExit } from "../common/output.js";
import { RatingOutput, SpectralReport, generateOpenApiRating } from "@rate-my-openapi/core";
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
      process.cwd(), "../", "../", "rulesets/rules.vacuum.yaml",
    );
    const openApiFile = await readFile(
      pathName,
    );
    const openApi = JSON.parse(openApiFile.toString()) as
      | OpenAPIV3_1.Document
      | OpenAPIV3.Document;
    const startTime = Date.now();
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
    const endTime = Date.now();
    const output: RatingOutput = generateOpenApiRating(outputReport, openApi);
    console.log(JSON.stringify(output, null, 2));
    const opFinishTime = Date.now();
    // Commented out for now so users can write the output as a valid JSON file
    // console.log("Time to run Vacuum: ", endTime - startTime, "ms");
    // console.log("Time to run operation: ", opFinishTime - opStartTime, "ms");
    process.exit(0);
  } catch (err) {
    printCriticalFailureToConsoleAndExit(err);
  }
}
