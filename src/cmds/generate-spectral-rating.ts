import { Argv } from "yargs";
import setBlocking from "../common/output.js";
import {
  Arguments,
  generateSpectralRating,
} from "../generate-spectral-rating/handler.js";

export default {
  desc: "Generate a rating for an OpenAPI file using Spectral",
  command: "generate-rating-spectral",
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
    await generateSpectralRating(argv as Arguments);
  },
};
