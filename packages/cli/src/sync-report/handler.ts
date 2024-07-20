import {
  printCriticalFailureToConsoleAndExit,
  printDiagnosticsToConsole,
  printResultToConsole,
} from "../common/output.js";
import { existsSync, createReadStream } from "node:fs";
import { join, relative, resolve } from "node:path";
import FormData from "form-data";
import { ReadableStream } from "node:stream/web";
import { ApiError } from "@zuplo/errors";

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

  const form = new FormData();
  const fileStream = createReadStream(openApiFilePath);

  // Append fields to the form
  form.append("name", argv.filename);
  form.append("apiFile", fileStream);

  const readable = new ReadableStream({
    async pull(controller) {
      return new Promise(function (resolve) {
        form.on("data", function (chunk) {
          controller.enqueue(chunk);
        });
        form.once("end", function () {
          resolve();
        });
        form.resume();
      });
    },
  });

  const newHeaders = {
    ...form.getHeaders(),
    ...{
      Authorization: `Bearer ${argv["api-key"]}`,
    },
  };

  printDiagnosticsToConsole(`Processing file ${argv.filename}`);

  try {
    const fileUploadResults = await fetch(
      `https://api.ratemyopenapi.com/sync-report`,
      {
        method: "POST",
        body: readable,
        headers: newHeaders,
        duplex: "half",
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
