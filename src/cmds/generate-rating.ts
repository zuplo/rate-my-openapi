import { Argv } from "yargs";
import setBlocking from "../common/output.js";
import { Arguments, generateRating } from "../generate-rating/handler.js";

export default {
  desc: "Generate a rating for an OpenAPI file",
  command: "generate-rating",
  builder: (yargs: Argv): Argv<unknown> => {
    return yargs
      .option("filepath", {
        type: "string",
        describe: "The filepath of the OpenAPI file to rate",
        default: ".",
        normalize: true,
        hidden: true,
      })
      .middleware([setBlocking]);
  },
  handler: async (argv: unknown) => {
    await generateRating(argv as Arguments);
  },
};
