import {
  printCriticalFailureToConsoleAndExit,
  printDiagnosticsToConsole,
  printResultToConsole,
} from "../common/output.js";
import { existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { ApiError } from "@zuplo/errors";
import { readFile } from "node:fs/promises";
import { lookup } from "mime-types";

export interface SyncReportArguments {
  dir: string;
  "api-key": string;
  filename: string;
}

export async function syncReport(argv: SyncReportArguments) {
  const sourceDirectory = resolve(join(relative(process.cwd(), argv.dir)));

  const openApiFilePath = join(sourceDirectory, argv.filename);
  if (!existsSync(openApiFilePath)) {
    printCriticalFailureToConsoleAndExit(
      `The Open API file path provided does not exist: ${argv.filename}. Please specify an existing Open API file and try again.`,
    );
  }

  // Read the file as a buffer
  const data = await readFile(openApiFilePath, "utf-8");

  // Convert the buffer to a Blob
  const lookuptMimeType = lookup(openApiFilePath);
  const file = new Blob([data], {
    type: typeof lookuptMimeType === "string" ? lookuptMimeType : undefined,
  });
  const formData = new FormData();
  formData.set("apiFile", file, argv.filename);

  printDiagnosticsToConsole(`Processing file ${argv.filename}`);

  try {
    const fileUploadResults = await fetch(
      `https://api.ratemyopenapi.com/sync-report`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${argv["api-key"]}`,
        },
      },
    );

    if (fileUploadResults.status !== 200) {
      const error = (await fileUploadResults.json()) as ApiError;
      printCriticalFailureToConsoleAndExit(`${error.detail ?? error.message}`);
    } else {
      // @TODO - show a nice table
      const res = await fileUploadResults.json();
      printResultToConsole(
        `File upload success: ${JSON.stringify(res, null, 2)}`,
      );
    }
  } catch (err) {
    // @TODO - show a nice useful error
    printCriticalFailureToConsoleAndExit(
      `Error on file upload: ${JSON.stringify(err)}`,
    );
  }
}
