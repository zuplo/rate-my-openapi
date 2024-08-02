import {
  printCriticalFailureToConsoleAndExit,
  printDiagnosticsToConsole,
  printGitHubIssue,
  printResultToConsoleAndExitGracefully,
  printScoreSimpleJSON,
  printScoreSummary,
} from "../common/output.js";
import { existsSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { ApiError } from "@zuplo/errors";
import { readFile } from "node:fs/promises";
import { lookup } from "mime-types";
import ora from "ora";
import { APIResponse, SyncReportArguments } from "./interfaces.js";

const okMark = "\x1b[32m✔\x1b[0m";
const failMark = "\x1b[31m✖\x1b[0m";

export async function syncReport(argv: SyncReportArguments) {
  printDiagnosticsToConsole(`Rate OpenAPI file ${argv.filename}`);
  printDiagnosticsToConsole(`Press Ctrl+C to cancel.\n`);
  const spinner = ora().start();
  spinner.text = "Loading file for processing";

  process.on("SIGTERM", () => {
    spinner.stop();
    printResultToConsoleAndExitGracefully("\nProcess has been canceled\n");
  });
  process.on("SIGINT", () => {
    spinner.stop();
    printResultToConsoleAndExitGracefully("\nProcess has been canceled\n");
  });

  const completePath =
    argv.dir && argv.dir !== "."
      ? join(argv.dir, argv.filename)
      : argv.filename;

  const openApiFilePath = isAbsolute(completePath)
    ? completePath
    : resolve(join(relative(process.cwd(), completePath)));

  if (!existsSync(openApiFilePath)) {
    spinner.stopAndPersist({ symbol: failMark });
    printCriticalFailureToConsoleAndExit(
      `The OpenAPI file path provided does not exist: ${openApiFilePath}. Please specify an existing OpenAPI file and try again.`,
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
          "User-Agent": "rmoa-cli-v1",
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

    let totalErrors = 0;
    let totalWarnings = 0;

    try {
      res.results.fullReport.issues.forEach((issue) => {
        let issueType: "error" | "warning" | "info";
        if (issue.severity === 0) {
          totalErrors++;
        } else {
          totalWarnings++;
        }

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

        printGitHubIssue(issue.message, {
          type: issueType,
          filename: openApiFilePath,
          line: issue.range.start.line,
          column: issue.range.start.character,
          endLine: issue.range.end.line,
          endColumn: issue.range.end.character,
        });
      });
    } catch (err) {
      console.error(`Failed to parse error details. Error: ${err.message}`);
    }

    switch (argv.output) {
      case "default":
        printScoreSummary(res);
        break;
      case "json":
        printScoreSimpleJSON(res);
        break;
      default:
        printScoreSummary(res);
    }

    const minimumPassingScore = argv["minimum-score"]
      ? parseInt(argv["minimum-score"])
      : 80;
    const maxErrors = argv["max-errors"]
      ? parseInt(argv["max-errors"])
      : undefined;
    const maxWarnings = argv["max-warnings"]
      ? parseInt(argv["max-warnings"])
      : undefined;

    if (totalErrors > 0 || totalWarnings > 0) {
      const totalProblems = totalErrors + totalWarnings;

      const finalMessage = IS_GITHUB_ACTION
        ? `::notice file=${argv.filename}::${totalProblems} problems (${totalErrors} errors, ${totalWarnings} warnings)`
        : `${failMark} ${totalProblems} problems (${totalErrors} errors, ${totalWarnings} warnings)`;

      console.log(finalMessage);
    }

    if (minimumPassingScore > res.results.simpleReport.score) {
      printCriticalFailureToConsoleAndExit(
        `The minimum passing score is '${minimumPassingScore}' and the lint score for this run is '${res.results.simpleReport.score}'`,
      );
    } else if (maxErrors && totalErrors > maxErrors) {
      printCriticalFailureToConsoleAndExit(
        `The total number of errors (${totalErrors}) exceeds the maximum amout of errors allowed (${maxErrors})`,
      );
    } else if (maxWarnings && totalWarnings > maxWarnings) {
      printCriticalFailureToConsoleAndExit(
        `The total number of warnings (${totalWarnings}) exceeds the maximum amout of warnings allowed (${maxWarnings})`,
      );
    }

    // @NOTE - perfect run, exit gracefully
    process.exit(0);
  } catch (err) {
    spinner.fail("Analizing file\n");
    // @TODO - show a nice useful error
    printCriticalFailureToConsoleAndExit(
      `Error on file upload: ${JSON.stringify(err)}`,
    );
  }
}
