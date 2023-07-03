import { SpectralReport } from "./interfaces";
import { getScoreDelta } from "./rating-utils";

export const COMPLETENESS_ISSUES = [
  'oas3-valid-schema-example',
  'operation-4xx-response',
  'path-declarations-must-exist',
  'operation-success-response',
  'operation-operationId',
  'oas3-host-not-example',
  'contact-properties',
  'info-contact',
  'info-description',
  'info-license',
  'license-url',
  'oas3-api-servers',
  'component-description',
  'oas3-parameter-description',
  'operation-description',
  'tag-description',
  'operation-tags',
  'openapi-tags',
  'operation-tag-defined',
  'oas3-operation-security-defined'
]

export const getCompletenessRating = (issues: SpectralReport) => {
  return getLengthNormalizedCompletenessRating(issues, 1);
};

export const getCompletenessIssues = (issues: SpectralReport) => {
  return issues.filter(
    (issue) =>
      typeof issue.code === "string" && COMPLETENESS_ISSUES.includes(issue.code)
  );
};

export const getLengthNormalizedCompletenessRating = (
  issues: SpectralReport,
  length: number
) => {
  let totalDelta = 0;
  const completenessIssues = issues.filter((issue) => {
    if (typeof issue.code === "string" && COMPLETENESS_ISSUES.includes(issue.code)) {
      totalDelta = totalDelta + getScoreDelta(issue.severity);
      return true;
    }
    return false;
  });
  return { completenessScore: Math.max(0, 100 - totalDelta / length), completenessIssues };
};
