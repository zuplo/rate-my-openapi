/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import chalk from "chalk";

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

export function printScoreResult(
  message: string,
  score: number,
  options?: {
    overrideGreen?: number;
    overrideYellow?: number;
    overrideRed?: number;
  },
) {
  const greenScore =
    options && options.overrideGreen ? options.overrideGreen : 80;
  const yellowScore =
    options && options.overrideYellow ? options.overrideYellow : 60;
  const redScore = options && options.overrideRed ? options.overrideRed : 59;

  if (score >= greenScore) {
    console.log(`${message} ${chalk.bold.green(score)}`);
  } else if (score >= yellowScore && score < greenScore) {
    console.log(`${message} ${chalk.bold.yellow(score)}`);
  } else if (score <= redScore) {
    console.log(`${message} ${chalk.bold.red(score)}`);
  } else {
    console.log(`${message} ${score}`);
  }
}
