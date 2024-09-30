import dotenv from "dotenv";
import { hideBin } from "yargs/helpers";
import yargs from "yargs";
import lint from "./cmds/lint.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { printCriticalFailureToConsoleAndExit } from "./common/output.js";
import { gte } from "semver";

dotenv.config();

const MIN_NODE_VERSION = "20.0.0";

if (gte(MIN_NODE_VERSION, process.versions.node)) {
  await printCriticalFailureToConsoleAndExit(
    `The Rate My OpenAPI CLI requires at least node.js v${MIN_NODE_VERSION}. You are using v${process.versions.node}. Please update your version of node.js.

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
} catch (e) {
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
