import dotenv from "dotenv";
import { hideBin } from "yargs/helpers";
import yargs from "yargs";
import report from "./cmds/report.js";

dotenv.config();

void yargs(hideBin(process.argv))
  .command(report)
  .demandCommand()
  .strictCommands()
  .version()
  .help().argv;
