import { Err, Ok, Result } from "ts-results-es";
import { load } from "js-yaml";
import esMain from "es-main";

export const checkFileIsJsonOrYaml = (
  fileContentString: string,
): Result<"yaml" | "json", UserErrorResult> => {
  try {
    JSON.parse(fileContentString);
    return Ok("json");
  } catch (_) {
    // Ignore
  }

  try {
    load(fileContentString);
    return Ok("yaml");
  } catch (err) {
    // Ignore
  }

  return Err({
    userMessage: "Invalid file format. Only JSON and YAML are supported.",
    debugMessage: "File can only be json or yaml",
    statusCode: 400,
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

if (esMain(import.meta)) {
  (async () => {
    if (
      validateOpenapi(
        `{
          "openapi": "3.0.0",
          "info": {
            "title": "The Zuplo Developer API, powered by Zuplo",
            "version": "1.0.0",
            "description": "Welcome to ZAPI",
            "termsOfService": "https://zuplo.com/legal/terms",
            "contact": {
              "name": "Zuplo",
              "url": "https://zuplo.com/",
              "email": "support@zuplo.com"
            }
          }
        }`,
      )
    ) {
      console.log("OpenAPI definition valid");
    } else {
      console.log("OpenAPI definition invalid");
    }
  })();
}
