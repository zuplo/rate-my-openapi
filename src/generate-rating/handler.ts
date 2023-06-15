import { join, relative } from "node:path";
import { printCriticalFailureToConsoleAndExit } from "../common/output.js";
import util from "node:util";
import { exec } from "child_process";
import { readFile } from "node:fs/promises";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import {
  OperationRating,
  PathRating,
  RatingOutput,
  SpectralReport,
} from "../interfaces.js";
const execAwait = util.promisify(exec);
export interface Arguments {
  filepath: string;
}
const getScoreDelta = (severity: 0 | 1 | 2 | 3) => {
  switch (severity) {
    case 0:
      return 50; // Essentially an error so judged harshly
    case 1:
      return 15; // Warning, likely affects end-user experience
    case 2:
      return 5; // Light warning, may not affect end-user
    case 3:
      return 1; // Info, prescriptive suggestions essentially
  }
};

const getPathIssueDelta = (pathIssues: SpectralReport) => {
  const pathIssuesBySeverity = pathIssues.reduce(
    (pathIssuesBySeverity, pathIssue) => {
      pathIssuesBySeverity[pathIssue.severity].push(pathIssue);
      return pathIssuesBySeverity;
    },
    { 0: [], 1: [], 2: [], 3: [] } as Record<
      0 | 1 | 2 | 3,
      SpectralReport
    >,
  );
  if (pathIssuesBySeverity[0].length) {
    // You have an error, that likely affects your all your operations
    return getScoreDelta(0);
  }
  if (pathIssuesBySeverity[1].length) {
    return 5 * pathIssuesBySeverity[1].length;
  }
  if (pathIssuesBySeverity[2].length) {
    return pathIssuesBySeverity[2].length;
  }
  if (pathIssuesBySeverity[3].length) {
    return Math.round(pathIssuesBySeverity[3].length * 0.1);
  }
  return 0;
};
export async function generateRating(argv: Arguments) {
  try {
    const filepath = argv.filepath;
    const pathName = join(relative(process.cwd(), filepath));
    const openApiFile = await readFile(
      pathName,
    );
    const openApi = JSON.parse(openApiFile.toString()) as
      | OpenAPIV3_1.Document
      | OpenAPIV3.Document;
    const { stdout, stderr } = await execAwait(
      `vacuum spectral-report -o ${pathName}`,
      { maxBuffer: undefined },
    );

    if (stderr) {
      throw stderr;
    }
    if (!stdout) {
      throw new Error("No output from vacuum. Confirm the file is not empty");
    }
    let outputReport: SpectralReport;
    try {
      outputReport = JSON.parse(stdout);
    } catch (err) {
      throw new Error(`Failed to parse vacuum output to JSON: ${err}`);
    }

    // Gather issues by the top level property they affect
    const issuesByArea = outputReport.reduce((issuesByArea, issue) => {
      const area = issue.path[0] as keyof typeof issuesByArea;
      if (!issuesByArea[area]) {
        issuesByArea[area] = [];
      }
      issuesByArea[area].push(issue);
      return issuesByArea;
    }, {
      components: [],
      paths: [],
      security: [],
      tags: [],
      info: [],
      servers: [],
      other: [],
    } as {
      components: SpectralReport;
      paths: SpectralReport;
      security: SpectralReport;
      tags: SpectralReport;
      info: SpectralReport;
      servers: SpectralReport;
      other: SpectralReport;
    });

    // Grab the path/operation issues first as they are the bulk of the API
    const issuesByPathAndOperation = issuesByArea.paths.reduce(
      (issuesByPathAndOperation, pathIssue) => {
        const path = pathIssue.path[1];
        if (!issuesByPathAndOperation[path]) {
          issuesByPathAndOperation[path] = {
            get: [],
            put: [],
            post: [],
            delete: [],
            options: [],
            head: [],
            patch: [],
            trace: [],
            other: [],
          };
        }
        const operation = pathIssue.path[2]
          ? pathIssue.path[2] as OpenAPIV3_1.HttpMethods
          : "other";
        issuesByPathAndOperation[path][operation].push(pathIssue);
        return issuesByPathAndOperation;
      },
      {} as Record<
        string,
        Record<OpenAPIV3_1.HttpMethods | "other", SpectralReport>
      >,
    );

    const { paths } = openApi;
    if (!paths) {
      throw new Error("No paths found in OpenAPI file");
    }

    // We iterate through the paths to calculate a score for each one and then
    // average them to get the overall score for the API's paths
    const pathRatings = Object.entries(paths).reduce(
      (pathRatings, [path, pathItem]) => {
        if (!pathItem) {
          // This should never happen
          throw new Error(`Path ${path} maps to an undefined pathItem`);
        }
        let pathRating: PathRating = {
          score: 100,
          issues: issuesByPathAndOperation[path]["other"],
        };
        const operations = [
          "get",
          "put",
          "post",
          "delete",
          "options",
          "head",
          "patch",
          "trace",
        ] as OpenAPIV3_1.HttpMethods[];
        // We calculate the path score by averaging the scores of the operations
        operations.forEach((operation) => {
          const operationItem = pathItem[operation];
          if (!operationItem) {
            return;
          }

          const operationIssues = issuesByPathAndOperation[path][operation];
          if (!operationIssues) {
            // No issues? Perfect score!
            pathRating[operation] = {
              score: 100,
              issues: [],
            };
            return;
          }

          // We calculate the operation score by averaging the scores of the
          // key properties of the operation

          // TODO: Add vacuum rule for summary
          // let summaryScore = operationItem.summary ? 100 : 0;
          let averagingDenominator = 2;
          let descriptionScore = operationItem.description ? 100 : 0;
          let responsesScore = 100;
          // GET and HEAD won't have a requestBody, and some POSTs might not
          // either
          let requestBodyScore = operationItem.requestBody ? 100 : undefined;
          if (requestBodyScore) {
            averagingDenominator++;
          }
          // You can have a parameter-less operation too
          let parametersScore = operationItem.parameters ? 100 : undefined;
          if (parametersScore) {
            averagingDenominator++;
          }
          operationIssues.forEach((issue) => {
            const scoreDelta = getScoreDelta(issue.severity);
            const property = issue.path[3] as string | undefined;
            if (!property) {
              if (issue.code.includes("description")) {
                descriptionScore = Math.max(
                  0,
                  descriptionScore - scoreDelta,
                );
              }
              return;
            }
            if (
              property?.startsWith("parameters") && parametersScore &&
              operationItem.parameters
            ) {
              parametersScore = Math.max(
                0,
                // Normalize the scoreDelta by the number of parameters
                // Ex. making a mistake on only 1 of 5 parameters should not
                // affect the score as much as making a mistake on all of them
                parametersScore -
                  (scoreDelta / operationItem.parameters.length),
              );
              return;
            }
            if (property === "requestBody" && requestBodyScore) {
              requestBodyScore = Math.max(0, requestBodyScore - scoreDelta);
              return;
            }
            if (property === "responses") {
              responsesScore = Math.max(
                0,
                // Same normalization as for parameters
                responsesScore -
                  (scoreDelta / Object.keys(operationItem.responses).length),
              );
              return;
            }
          });
          const operationScore = Math.round(
            (descriptionScore + responsesScore + (requestBodyScore ?? 0) +
              (parametersScore ?? 0)) / averagingDenominator,
          );
          pathRating[operation] = {
            score: operationScore,
            issues: operationIssues,
          };
          pathRating.issues = pathRating.issues.concat(operationIssues);
        });

        const pathIssues = issuesByPathAndOperation[path]["other"];
        const pathIssuesDelta = getPathIssueDelta(pathIssues);
        const numOperations = Object.keys(pathRating).length - 2;
        if (numOperations) {
          const totalScore = Object.entries(pathRating).reduce(
            (sum, [operation, operationRating]) => {
              if (operation === "score" || operation === "issues") {
                return sum;
              }
              return sum + (operationRating as OperationRating).score;
            },
            0,
          );
          pathRating.score = Math.round(
            (totalScore / numOperations) - pathIssuesDelta,
          );
        } else {
          pathRating.score = 0; // Wtf, why document a path with no operations - FAIL
        }

        pathRatings[path] = pathRating;
        return pathRatings;
      },
      {} as Record<string, PathRating>,
    );

    const totalScore = Object.values(pathRatings).reduce(
      (sum, pathRating) => {
        return sum + pathRating.score;
      },
      0,
    );
    const openApiScore = Math.round(
      totalScore / Object.keys(pathRatings).length,
    );
    const output: RatingOutput = {
      score: openApiScore,
      issues: outputReport,
      paths: pathRatings,
    };
    console.log(output);
    process.exit(0);
  } catch (err) {
    printCriticalFailureToConsoleAndExit(err);
  }
}
