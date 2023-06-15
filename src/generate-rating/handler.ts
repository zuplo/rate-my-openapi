import { join, relative } from "node:path";
import { printCriticalFailureToConsoleAndExit } from "../common/output.js";
import util from "node:util";
import { exec } from "child_process";
import { readFile } from "node:fs/promises";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import {
  OperationRating,
  PathRating,
  RatingOutput,
  SpectralReport,
} from "../interfaces.js";
import { generateOpenApiRating } from "../utils/rating-utils.js";
const execAwait = util.promisify(exec);
export interface Arguments {
  filepath: string;
}

export async function generateRating(argv: Arguments) {
  try {
    const opStartTime = Date.now();
    const filepath = argv.filepath;
    const pathName = join(relative(process.cwd(), filepath));
    const openApiFile = await readFile(
      pathName,
    );
    const openApi = JSON.parse(openApiFile.toString()) as
      | OpenAPIV3_1.Document
      | OpenAPIV3.Document;
    const startTime = Date.now();
    const { stdout, stderr } = await execAwait(
      `vacuum spectral-report -o ${pathName}`,
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
    console.log(output);
    const opFinishTime = Date.now();
    console.log("Time to run Vacuum: ", endTime - startTime, "ms");
    console.log("Time to run operation: ", opFinishTime - opStartTime, "ms");
    process.exit(0);
  } catch (err) {
    printCriticalFailureToConsoleAndExit(err);
  }
}
