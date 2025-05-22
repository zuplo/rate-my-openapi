/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from "chalk";

// We standardize printing to the terminal with this module

// According to https://unix.stackexchange.com/questions/331611/do-progress-reports-logging-information-belong-on-stderr-or-stdout
// any diagnostic information should go to stderr, and only the actual output goes to stdout
export function printDiagnosticsToConsole(message?: any) {
  console.error(chalk.bold.blue(message));
}

// This information is displayed to the user, so it should be actionable.
export function printCriticalFailureToConsoleAndExit(message?: any) {
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

export function printResultToConsoleAndExitGracefully(message?: any) {
  printResultToConsole(message);
  process.exit(0);
}

export function printTableToConsoleAndExitGracefully(table: any) {
  printTableToConsole(table);
  process.exit(0);
}

// See https://nodejs.org/docs/latest-v18.x/api/process.html#a-note-on-process-io
// We want to deliberately have STDOUT flush synchronously, so we can pipe the output to another command

interface WriteStreamWithHandle {
  _handle: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    setBlocking: Function;
  };
  isTTY: boolean;
}

export default function setBlocking() {
  // Deno and browser have no process object:
  if (typeof process === "undefined") return;
  [process.stdout, process.stderr].forEach((_stream) => {
    const stream = _stream as any as WriteStreamWithHandle;
    if (
      stream._handle &&
      stream.isTTY &&
      typeof stream._handle.setBlocking === "function"
    ) {
      stream._handle.setBlocking(true);
    }
  });
}
