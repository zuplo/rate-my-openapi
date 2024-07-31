import { SyncReportArguments } from "sync-report/interfaces.js";
import { syncReport } from "../sync-report/handler.js";
import { Argv } from "yargs";

export default {
  desc: "Lint & get a score for your OpenAPI definition using the Rate My OpenAPI ruleset",
  command: "lint",

  builder: (yargs: Argv): Argv<unknown> => {
    return yargs
      .option("api-key", {
        type: "string",
        describe: "Your Rate My OpenAPI API Key",
        envVar: "API_KEY",
      })
      .option("filename", {
        type: "string",
        describe: "The OpenApi file name to process",
      })
      .option("dir", {
        type: "string",
        describe: "The directory containing your OpenAPI file",
        default: ".",
        normalize: true,
      })
      .option("output", {
        type: "string",
        describe: "default, json",
        default: "default",
      })
      .option("max-warnings", {
        type: "number",
        describe:
          "The maximum number of warnings allowed before labeling the run as failed.",
      })
      .option("max-errors", {
        type: "number",
        describe:
          "The maximum number of errors allowed before labeling the run as failed.",
      })
      .option("minimum-score", {
        type: "number",
        describe:
          "The minimum score (0 - 100) to label a lint run as successful/passing. Default is 80.",
        default: 80,
      })
      .demandOption(["api-key", "filename"]);
  },
  handler: async (argv: unknown) => {
    await syncReport(argv as SyncReportArguments);
  },
};
