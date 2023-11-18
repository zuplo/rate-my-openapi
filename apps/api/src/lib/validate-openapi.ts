import { ApiError, Problems } from "@zuplo/errors";
import { load } from "js-yaml";

export const checkFileIsJsonOrYaml = (
  fileContentString: string,
): "yaml" | "json" => {
  try {
    JSON.parse(fileContentString);
    return "json";
  } catch (_) {
    // Ignore
  }

  try {
    load(fileContentString);
    return "yaml";
  } catch (err) {
    // Ignore
  }

  throw new ApiError({
    ...Problems.BAD_REQUEST,
    detail: "Invalid file format. Only JSON and YAML are supported.",
  });
};

const validateOpenapi = (content: string) => {
  return (
    ["3.0.0", "3.0.1", "3.0.2", "3.0.3", "3.1.0"].find((version) =>
      content.includes(version),
    ) !== undefined
  );
};

export default validateOpenapi;
