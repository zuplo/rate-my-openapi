/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from "chalk";
import { APIResponse } from "../sync-report/interfaces.js";

// We standardize printing to the terminal with this module

// According to https://unix.stackexchange.com/questions/331611/do-progress-reports-logging-information-belong-on-stderr-or-stdout
// any diagnostic information should go to stderr, and only the actual output goes to stdout
export function printDiagnosticsToConsole(message?: any) {
  console.error(chalk.bold.blue(message));
}

export function printWarningToConsole(message?: any) {
  console.error(message);
}

// This information is displayed to the user, so it should be actionable.
export async function printCriticalFailureToConsoleAndExit(message?: any) {
  console.error(chalk.bold.red(message));
  process.exit(1);
}

// Only use this to output the actual result of a command
// This outputs to STDOUT, which is reserved for the actual result of a command
export function printResultToConsole(message?: any) {
  console.log(chalk.bold.green(message));
}

// Only use this to output the actual result of a command
// This outputs to STDOUT, which is reserved for the actual result of a command
export function printTableToConsole(table: any) {
  console.table(table);
}

export async function printResultToConsoleAndExitGracefully(message?: any) {
  printResultToConsole(message);
  process.exit(0);
}

export async function printTableToConsoleAndExitGracefully(table: any) {
  printTableToConsole(table);
  process.exit(0);
}

export function printScoreResult(message: string, score: number) {
  if (score >= 0 && score < 50) {
    console.log(`${message} ${chalk.bold.red(score)}`);
  } else if (score >= 50 && score < 80) {
    console.log(`${message} ${chalk.bold.yellow(score)}`);
  } else if (score >= 80) {
    console.log(`${message} ${chalk.bold.green(score)}`);
  } else {
    console.log(`${message} ${score}`);
  }
}

export function printScoreSummary(report: APIResponse) {
  console.log(`${chalk.bold.blue("==>")} ${chalk.bold("Results")}\n`);
  printScoreResult("Overall", report.results.simpleReport.score);
  console.log("======");
  printScoreResult("- Docs", report.results.simpleReport.docsScore);
  printScoreResult(
    "- Completeness",
    report.results.simpleReport.completenessScore,
  );
  printScoreResult(
    "- SDK Generation",
    report.results.simpleReport.sdkGenerationScore,
  );
  printScoreResult("- Security", report.results.simpleReport.securityScore);
  console.log("======\n");
  console.log(
    `View details of your report at ${chalk.magenta(report.reportUrl)}\n`,
  );
}

export function printScoreSimpleJSON(report: APIResponse) {
  const simpleReport = {
    overallScore: report.results.simpleReport.score,
    docsScore: report.results.simpleReport.docsScore,
    completenessScore: report.results.simpleReport.completenessScore,
    securityScore: report.results.simpleReport.securityScore,
    sdkGenerationScore: report.results.simpleReport.sdkGenerationScore,
    reportUrl: report.reportUrl,
  };
  console.log(JSON.stringify(simpleReport, null, 2));
}

export function printGitHubErrorWarning(
  message: string,
  issue: {
    type: "error" | "warning";
    filename: string;
    line: number;
    endLine: number;
    column: number;
    endColumn: number;
  },
) {
  const IS_GITHUB_ACTION = !!process.env.GITHUB_ACTIONS;

  if (IS_GITHUB_ACTION) {
    console.log(
      `::${issue.type} file=${issue.filename},line=${issue.line},col=${issue.column},endLine=${issue.endLine}endColumn=${issue.endColumn}::${message}`,
    );
    console.log("\n");
  }
}
