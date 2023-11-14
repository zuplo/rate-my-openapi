import { createHash } from "crypto";
import fs from "fs/promises";
import path from "path";
import { getStorageBucketName, getStorageClient } from "../services/storage.js";
import { getReport, uploadReport } from "./rating.clean.js";

export async function createReportFromLocal(
  fsPath: string,
  reportId: string,
  lastHash?: string,
) {
  const content = await fs.readFile(fsPath, "utf-8");
  const fileExtension = path.extname(fsPath).replace(".", "");
  if (!["json", "yaml"].includes(fileExtension)) {
    throw new Error("invalid file extension");
  }

  const hash = Buffer.from(
    createHash("sha256").update(content).digest("hex"),
  ).toString();

  if (lastHash === hash) {
    console.log(`Skipping ${fsPath} because it hasn't changed`);
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
