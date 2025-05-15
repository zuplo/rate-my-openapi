import { ProblemDetails, Problems } from "@zuplo/errors";
import { load } from "js-yaml";
import { OpenApiFileExtension } from "./types.js";
import spectralCore, { Document } from "@stoplight/spectral-core";
import SpectralParsers from "@stoplight/spectral-parsers";

export const checkFileIsJsonOrYaml = (
  fileContentString: string,
): OpenApiFileExtension | ProblemDetails => {
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

  return {
    ...Problems.BAD_REQUEST,
    detail: "Invalid file format. Only JSON and YAML are supported.",
  };
};

const validateOpenapi = (options: {
  fileContent: string;
  fileExtension: string;
}): { isValid: true } | { isValid: false; error: ProblemDetails } => {
  const parser =
    options.fileExtension === "json"
      ? SpectralParsers.Json
      : SpectralParsers.Yaml;

  let openApiSpectralDoc: spectralCore.Document;
  try {
    openApiSpectralDoc = new Document(
      options.fileContent,
      parser as SpectralParsers.IParser,
      options.fileExtension,
    );
  } catch (err) {
    return {
      isValid: false,
      error: {
        ...Problems.BAD_REQUEST,
        detail: "Could not parse OpenAPI file. Possible syntax error.",
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openAPIFileVersion = (openApiSpectralDoc.data as any)?.openapi;

  if (!openAPIFileVersion) {
    // if no version is specified, assume it's a swagger file
    return {
      isValid: false,
      error: {
        ...Problems.BAD_REQUEST,
        detail: "No OpenAPI version specified. Only OpenAPI v3.x is supported.",
      },
    };
  }

  const validVersionExists = openAPIFileVersion.startsWith("3.");
  if (!validVersionExists) {
    return {
      isValid: false,
      error: {
        ...Problems.BAD_REQUEST,
        detail: `Invalid OpenAPI version. Only OpenAPI v3.x is supported. Found: ${openAPIFileVersion}.`,
      },
    };
  }
  return { isValid: true };
};

export default validateOpenapi;
