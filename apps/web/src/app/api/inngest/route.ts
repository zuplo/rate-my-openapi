import { serve } from "inngest/next";
import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";
import { load as loadYAML } from "js-yaml";
import {
  type IParser,
  Json as JSONParser,
  Yaml as YAMLParser,
} from "@stoplight/spectral-parsers";
import { Spectral, Document } from "@stoplight/spectral-core";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";

import fs from "fs";
import { writeFile, unlink } from "fs/promises";
import util from "util";
import { exec } from "child_process";
import { join } from "path";

import { generateOpenApiRating } from "@rate-my-openapi/core";

import { inngest } from "../inngest-client";

const execAwait = util.promisify(exec);

const {
  GOOGLE_SERVICE_ACCOUNT_B64,
  NEXT_PUBLIC_GOOGLE_CLOUD_STORAGE_BUCKET: bucket,
} = process.env;

const credential = JSON.parse(
  Buffer.from(GOOGLE_SERVICE_ACCOUNT_B64 as string, "base64")
    .toString()
    .replace(/\n/g, "")
);

const storage = new Storage({
  projectId: credential.project_id,
  credentials: {
    client_email: credential.client_email,
    private_key: credential.private_key,
  },
});

const uploadFile = inngest.createFunction(
  { name: "Upload File" },
  { event: "api/upload" },
  async ({ step, event }) => {
    // file comes back as return type of Buffer.toJSON();
    const { email, file, fileType } = event.data;

    try {
      const uuid = uuidv4();
      const fileContents = Buffer.from(file.data).toString();
      const fileName = `${uuid}.${fileType}`;

      await storage
        .bucket(bucket as string)
        .file(fileName)
        .save(fileContents);

      return await step.sendEvent({
        name: "api/generate",
        data: {
          id: uuid,
          email,
          fileName,
          fileType,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
);

const generateRating = inngest.createFunction(
  { name: "Generate Rating" },
  { event: "api/generate" },
  async ({ step, event }) => {
    const { email, id, fileName, fileType } = event.data;

    const file = await storage
      .bucket(bucket as string)
      .file(fileName)
      .download();

    const contentString = file.toString();

    const report = await getReport(contentString, fileType, id);

    if (report) {
      await storage
        .bucket(bucket as string)
        .file(`${id}-report.json`)
        .save(Buffer.from(JSON.stringify(report)));
    }

    return await step.sendEvent({
      name: "api/email",
      data: { email, id },
    });
  }
);

const sendEmail = inngest.createFunction(
  { name: "Send Email" },
  { event: "api/email" },
  async () => {
    return true;
  }
);

export const { GET, POST, PUT } = serve(inngest, [
  uploadFile,
  generateRating,
  sendEmail,
]);

const getReport = async (content: string, fileType: string, id: string) => {
  const tempApiFilePath = `public/temp_uploads/${id}.${fileType}`;

  try {
    await writeFile(tempApiFilePath, Buffer.from(content));
  } catch (e) {
    console.error(e);
    throw new Error(`Unable to write temporary upload file. File ID: ${id}`);
  }

  const rulesetPath = join(
    process.cwd(),
    "../",
    "../",
    "rulesets/rules.vacuum.yaml"
  );

  let vacuumCliReport;
  try {
    const { stdout, stderr } = await execAwait(
      `vacuum spectral-report -r ${rulesetPath} -o ${tempApiFilePath}`,
      { maxBuffer: undefined }
    );

    if (stderr) {
      throw new Error(stderr);
    }

    if (!stdout) {
      throw new Error(
        `No output from Vacuum. Confirm the file is not empty. File ID: ${id}`
      );
    }

    vacuumCliReport = stdout;
  } catch {
    throw new Error("Could not execute Vacuum CLI command.");
  }

  if (vacuumCliReport) {
    let spectralOutputReport;
    try {
      const parser = fileType === "json" ? JSONParser : YAMLParser;

      const openApiSpectralDoc = new Document(
        content,
        parser as IParser,
        tempApiFilePath
      );

      const spectral = new Spectral();
      const rulesetFilepath = join(
        process.cwd(),
        "../",
        "../",
        "rulesets",
        ".spectral-supplement.yaml"
      );

      try {
        const spectralRuleset = await bundleAndLoadRuleset(rulesetFilepath, {
          fs,
          fetch,
        });
        spectral.setRuleset(spectralRuleset);
      } catch {
        throw new Error("Unable to set Spectral ruleset");
      }

      spectralOutputReport = await spectral.run(openApiSpectralDoc);
    } catch (e) {
      console.error(e || "Could not generate Spectral report");
    }

    const initialOutputReport = JSON.parse(vacuumCliReport);
    const outputReport = spectralOutputReport
      ? [...initialOutputReport, ...spectralOutputReport]
      : initialOutputReport;

    const outputContent =
      fileType === "json"
        ? JSON.parse(content)
        : loadYAML(content, { json: true });

    const output = generateOpenApiRating(outputReport, outputContent);

    try {
      await unlink(tempApiFilePath);
    } catch {
      console.error(`Unable to delete temporary upload file. File ID: ${id}`);
    }

    return output;
  } else {
    throw new Error(
      "Vacuum CLI command succeeded but did not generate a report"
    );
  }
};
