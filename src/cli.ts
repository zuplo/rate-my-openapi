import * as dotenv from "dotenv";
dotenv.config();
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import rate from "./cmds/generate-rating.js";

void yargs(hideBin(process.argv))
  // This means that all env vars will have to be prefixed with RATE_MY_OPEN_API_
  .env("RATE_MY_OPEN_API")
  .command(rate)
  .demandCommand()
  .strictCommands()
  .version()
  .help().argv;
