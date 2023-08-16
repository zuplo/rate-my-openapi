import { Argv, CommandModule } from "yargs";
import setBlocking from "../common/output.js";
import { Arguments, generateRating } from "../handlers/generate-rating.js";

export const generateRatingCommand: CommandModule<any, any> = {
  command: "generate-rating",
  describe: "Generate a rating for an OpenAPI file using Vacuum",
  builder: (yargs: Argv): Argv<unknown> => {
    return yargs
      .option("filepath", {
        type: "string",
        describe: "The filepath of the OpenAPI file to rate",
        demandOption: true,
        normalize: true,
      })
      .option("format", {
        type: "string",
        describe: '"json" or "yaml"',
        default: "json",
      })
      .middleware([setBlocking]);
  },
  handler: async (argv: unknown) => {
    await generateRating(argv as Arguments);
  },
};
