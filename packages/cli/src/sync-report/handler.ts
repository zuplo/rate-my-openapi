import {
  printCriticalFailureToConsoleAndExit,
  printDiagnosticsToConsole,
  printResultToConsoleAndExitGracefully,
  printScoreSimpleJSONAndExitGracefully,
  printScoreSummaryAndExitGracefully,
} from "../common/output.js";
import { existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { ApiError } from "@zuplo/errors";
import { readFile } from "node:fs/promises";
import { lookup } from "mime-types";
import ora from "ora";
import { APIResponse, SyncReportArguments } from "./interfaces.js";

const okMark = "\x1b[32m✔\x1b[0m";
const failMark = "\x1b[31m✖\x1b[0m";

export async function syncReport(argv: SyncReportArguments) {
  printDiagnosticsToConsole(`Rate Open API file ${argv.filename}`);
  printDiagnosticsToConsole(`Press Ctrl+C to cancel.\n`);
  const spinner = ora("Loading file for processing").start();

  process.on("SIGTERM", () => {
    spinner.stop();
    printResultToConsoleAndExitGracefully("\nProcess has been canceled\n");
  });
  process.on("SIGINT", () => {
    spinner.stop();
    printResultToConsoleAndExitGracefully("\nProcess has been canceled\n");
  });

  const sourceDirectory = resolve(join(relative(process.cwd(), argv.dir)));

  const openApiFilePath = join(sourceDirectory, argv.filename);
  if (!existsSync(openApiFilePath)) {
    spinner.stopAndPersist({ symbol: failMark });
    printCriticalFailureToConsoleAndExit(
      `The Open API file path provided does not exist: ${argv.filename}. Please specify an existing Open API file and try again.`,
    );
  }
  spinner.stopAndPersist({ symbol: okMark });

  // Read the file as a buffer
  const data = await readFile(openApiFilePath, "utf-8");

  // Convert the buffer to a Blob
  const lookuptMimeType = lookup(openApiFilePath);
  const file = new Blob([data], {
    type: typeof lookuptMimeType === "string" ? lookuptMimeType : undefined,
  });
  const formData = new FormData();
  formData.set("apiFile", file, argv.filename);

  spinner.start();
  spinner.text = "Analizing file";

  try {
    const fileUploadResults = await fetch(
      `https://api.ratemyopenapi.com/sync-report`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${argv["api-key"]}`,
        },
      },
    );

    if (fileUploadResults.status !== 200) {
      spinner.fail("Analizing file\n");
      const error = (await fileUploadResults.json()) as ApiError;
      printCriticalFailureToConsoleAndExit(`${error.detail ?? error.message}`);
    }

    spinner.succeed("Analizing file\n");
    const res = (await fileUploadResults.json()) as APIResponse;

    const IS_GITHUB_ACTION = !!process.env.GITHUB_ACTIONS;

    if (IS_GITHUB_ACTION) {
      try {
        res.results.fullReport.issues.forEach((issue) => {
          console.log(`${openApiFilePath}`);
          let issueType: "error" | "warning" | "info";
          switch (issue.severity) {
            case 0:
              issueType = "error";
              break;
            case 1:
            case 2:
              issueType = "warning";
              break;
            default:
              issueType = "error";
          }

          console.log(
            `::${issueType} file=${openApiFilePath},line=${issue.range.start.line},col=${issue.range.start.character},endLine=${issue.range.end.line}endColumn=${issue.range.end.character}::${issue.message}`,
          );
          console.log("\n");
        });
      } catch (err) {
        console.error(`Failed to return CI details. Error: ${err.message}`);
      }
    }

    switch (argv.output) {
      case "default":
        printScoreSummaryAndExitGracefully(res);
        break;
      case "json":
        printScoreSimpleJSONAndExitGracefully(res);
        break;
      default:
        printScoreSummaryAndExitGracefully(res);
    }
  } catch (err) {
    spinner.fail("Analizing file\n");
    // @TODO - show a nice useful error
    printCriticalFailureToConsoleAndExit(
      `Error on file upload: ${JSON.stringify(err)}`,
    );
  }
}
