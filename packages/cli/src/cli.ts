import * as dotenv from "dotenv";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { generateRatingCommand } from "./cmds/generate-rating.js";
import { generateSpectralCommand } from "./cmds/generate-spectral-rating.js";
dotenv.config();

void yargs(hideBin(process.argv))
  // This means that all env vars will have to be prefixed with RATE_MY_OPEN_API_
  .env("RATE_MY_OPEN_API")
  .command(generateRatingCommand)
  .command(generateSpectralCommand)
  .demandCommand()
  .strictCommands()
  .version()
  .help().argv;
