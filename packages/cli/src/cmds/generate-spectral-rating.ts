import { Argv, CommandModule } from "yargs";
import setBlocking from "../common/output.js";
import {
  Arguments,
  generateSpectralRating,
} from "../handlers/generate-spectral-rating.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateSpectralCommand: CommandModule<any, any> = {
  describe: "Generate a rating for an OpenAPI file using Spectral",
  command: "generate-spectral-rating",
  builder: (yargs: Argv): Argv<unknown> => {
    return yargs
      .option("filepath", {
        type: "string",
        describe: "The filepath of the OpenAPI file to rate",
        normalize: true,
        demandOption: true,
      })
      .option("format", {
        type: "string",
        describe: '"json" or "yaml"',
        default: "json",
      })
      .middleware([setBlocking]);
  },
  handler: async (argv: unknown) => {
    await generateSpectralRating(argv as Arguments);
  },
};
