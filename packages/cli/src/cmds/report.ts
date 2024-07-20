import { syncReport, SyncReportArguments } from "../sync-report/handler.js";
import { Argv } from "yargs";

export default {
  desc: "Uploads an Open API file & gets it's Rate My Open API results",
  command: "report",

  builder: (yargs: Argv): Argv<unknown> => {
    return yargs
      .option("api-key", {
        type: "string",
        describe: "The API Key from Zuplo",
        envVar: "API_KEY",
      })
      .option("filename", {
        type: "string",
        describe: "The OpenApi file name to process",
      })
      .option("dir", {
        type: "string",
        describe: "The directory containing your Open API file",
        default: ".",
        normalize: true,
      })
      .demandOption(["api-key", "filename"]);
  },
  handler: async (argv: unknown) => {
    await syncReport(argv as SyncReportArguments);
  },
};
