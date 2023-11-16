import { createHash } from "crypto";
import fs from "fs/promises";
import path from "path";
import { Logger } from "pino";
import { getStorageBucketName, getStorageClient } from "../services/storage.js";
import {
  GetReportOutput,
  ReportGenerationError,
  getReport,
  uploadReport,
} from "./rating.clean.js";

export type LocalReportOutput = GetReportOutput & { hash: string };

export { ReportGenerationError };

export async function createReportFromLocal(
  fsPath: string,
  reportId: string,
  logger: Logger,
  lastHash?: string,
): Promise<LocalReportOutput | undefined> {
  const content = await fs.readFile(fsPath, "utf-8");
  const fileExtension = path.extname(fsPath).replace(".", "");
  if (!["json", "yaml"].includes(fileExtension)) {
    throw new Error("invalid file extension");
  }

  const hash = Buffer.from(
    createHash("sha256").update(content).digest("hex"),
  ).toString();

  if (lastHash === hash) {
    return;
  }

  const fileName = `${reportId}.${fileExtension}`;

  await getStorageClient()
    .bucket(getStorageBucketName())
    .file(fileName)
    .save(content);

  const reportResult = await getReport({
    fileContent: content,
    fileExtension: fileExtension as "json" | "yaml",
    reportId,
    openAPIFilePath: fsPath,
  });

  await uploadReport({
    reportId,
    ...reportResult,
  });

  return { ...reportResult, hash };
}
