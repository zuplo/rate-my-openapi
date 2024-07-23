import dotenv from "dotenv";
import { hideBin } from "yargs/helpers";
import yargs from "yargs";
import lint from "./cmds/lint.js";

dotenv.config();

void yargs(hideBin(process.argv))
  .command(lint)
  .demandCommand()
  .strictCommands()
  .version()
  .help().argv;
