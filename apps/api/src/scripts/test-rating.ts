import { config } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { getReport } from "../lib/rating.js";
import { assertValidFileExtension } from "../lib/types.js";

config();

const inputPath = process.argv[2];
if (!inputPath) {
  console.error(
    "Usage: node dist/scripts/test-rating.js <path-to-openapi-spec>",
  );
  process.exit(1);
}

const absPath = path.resolve(inputPath);
const ext = path.extname(absPath).replace(".", "");
assertValidFileExtension(ext);

const content = await readFile(absPath, "utf-8");

console.log(`Rating ${absPath}...`);
const result = await getReport({
  fileContent: content,
  fileExtension: ext,
  reportId: "local-test",
  openAPIFilePath: absPath,
});

console.log("\n=== Scores ===");
console.log(`overall:        ${result.simpleReport.score}`);
console.log(`docs:           ${result.simpleReport.docsScore}`);
console.log(`completeness:   ${result.simpleReport.completenessScore}`);
console.log(`security:       ${result.simpleReport.securityScore}`);
console.log(`sdkGeneration:  ${result.simpleReport.sdkGenerationScore}`);

const report = result.simpleReport as typeof result.simpleReport & {
  shortSummary?: string;
  longSummary?: string;
};

console.log("\n=== Short summary ===");
console.log(report.shortSummary ?? "(none)");

console.log("\n=== Long summary ===");
console.log(report.longSummary ?? "(none)");
