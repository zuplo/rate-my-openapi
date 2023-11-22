import { ApiError, Problems } from "@zuplo/errors";
import { load } from "js-yaml";
import { OpenApiFileExtension } from "./types.js";
import spectralCore, { Document } from "@stoplight/spectral-core";
import SpectralParsers from "@stoplight/spectral-parsers";

export const checkFileIsJsonOrYaml = (
  fileContentString: string,
): OpenApiFileExtension => {
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

const validateOpenapi = (options: {
  fileContent: string;
  fileExtension: string;
}) => {
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
    throw new ApiError({
      ...Problems.BAD_REQUEST,
      detail: "Could not parse OpenAPI file. Possible syntax error.",
    });
  }

  // TODO: clean this up
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openAPIFileVersion = (openApiSpectralDoc.data as any)?.openapi || "";

  if (!openAPIFileVersion) {
    // if no version is specified, assume it's a swagger file
    return false;
  }

  const validVersionExists =
    ["3.0.0", "3.0.1", "3.0.2", "3.0.3", "3.1.0"].find((version) =>
      openAPIFileVersion.includes(version),
    ) !== undefined;

  return validVersionExists;
};

export default validateOpenapi;
