import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { lt } from "semver";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import lint from "./cmds/lint.js";
import { printCriticalFailureToConsoleAndExit } from "./common/output.js";

dotenv.config();

const MIN_NODE_VERSION = "20.0.0";

if (lt(process.versions.node, MIN_NODE_VERSION)) {
  await printCriticalFailureToConsoleAndExit(
    `The Rate My OpenAPI CLI requires at least Node.js v${MIN_NODE_VERSION}. You are using v${process.versions.node}. Please update your version of Node.js.

    Consider using a Node.js version manager such as https://github.com/nvm-sh/nvm.`,
  );
}

let packageJson;
try {
  packageJson = JSON.parse(
    readFileSync(
      fileURLToPath(new URL("../package.json", import.meta.url)),
      "utf-8",
    ),
  );
} catch (_err) {
  await printCriticalFailureToConsoleAndExit(
    `Unable to load rmoa. The package.json is missing or malformed.`,
  );
}

const cli = yargs(hideBin(process.argv))
  .env()
  .command(lint)
  .demandCommand()
  .strictCommands()
  .version()
  .version(packageJson?.version)
  .fail(false)
  .help();

try {
  await cli.argv;
} catch (err) {
  await printCriticalFailureToConsoleAndExit(err.message ?? err);
  cli.showHelp();
}
