import { COMMON_CRITICAL_ISSUES } from "./common-rating-utils";
import { SpectralReport } from "./interfaces";
import { getScoreDelta } from "./rating-utils";

export const DOCS_ISSUES = [
  ...COMMON_CRITICAL_ISSUES,
  "oas3-valid-schema-example",
  "operation-4xx-response",
  "operation-operationId-valid-in-url",
  "operation-success-response",
  "operation-operationId",
  "operation-operationId-unique",
  "oas3-host-not-example",
  "oas3-host-trailing-slash",
  "contact-properties",
  "info-description",
  "oas3-api-servers",
  "no-script-tags-in-markdown",
  "component-description",
  "oas3-parameter-description",
  "operation-description",
  "tag-description",
  "operation-tags",
  "openapi-tags",
  "operation-tag-defined",
  "typed-enum",
  "duplicated-entry-in-enum",
  "path-keys-no-trailing-slash",
  "operation-parameters",
  "path-params",
  "no-ambiguous-paths",
  "no-http-verbs-in-path",
  "path-not-include-query",
  "redocly-operation-summary",
  "redocly-no-server-variables-empty-enum",
  "redocly-no-undefined-server-variable",
];

export function getDocsRating(issues: SpectralReport) {
  return getLengthNormalizedDocsRating(issues, 1);
}

export function getDocsIssues(issues: SpectralReport) {
  return issues
    .filter(
      (issue) =>
        typeof issue.code === "string" && DOCS_ISSUES.includes(issue.code),
    )
    .sort(
      (a, b) => a.severity - b.severity || a.message.localeCompare(b.message),
    );
}

export function getLengthNormalizedDocsRating(
  issues: SpectralReport,
  length: number,
) {
  let totalDelta = 0;
  const docsIssues = issues.filter((issue) => {
    if (typeof issue.code === "string" && DOCS_ISSUES.includes(issue.code)) {
      totalDelta = totalDelta + getScoreDelta(issue.severity);
      return true;
    }
    return false;
  });
  return { docsScore: Math.max(0, 100 - totalDelta / length), docsIssues };
}
