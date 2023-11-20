export type OpenApiFileExtension = "json" | "yaml";

export interface RatingWorkerData {
  reportId: string;
  requestId: string;
  fileExtension: OpenApiFileExtension;
  email: string | undefined;
}

export function assertValidFileExtension(
  fileExtension: unknown,
): asserts fileExtension is OpenApiFileExtension {
  if (typeof fileExtension !== "string") {
    throw new Error("File extension value is not a string");
  }
  if (!["json", "yaml"].includes(fileExtension)) {
    throw new Error(
      `File extension must be either 'json' or 'yaml', received '${fileExtension}'`,
    );
  }
}
