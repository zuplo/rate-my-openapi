import { COMMON_CRITICAL_ISSUES } from "./common-rating-utils";
import { SpectralReport } from "./interfaces";
import { getScoreDelta } from "./rating-utils";

/**
 * Inspired by Apimatic: https://www.apimatic.io/blog/2022/11/14-best-practices-to-write-openapi-for-better-api-consumption/
 * 1. No Empty Servers List 🟢
 * 2. Titles, Names, And Summaries Should Not Exceed 50 Characters 🟡
 * 3. No Inline Schemas Definition 🟡
 * 4. No Missing Example(s) 🟢
 * 5. No Invalid Examples  🟢
 * 6. At Least One Security Scheme 🟢
 * 7. OperationId Is Required 🟢
 * 8. No Invalid OperationId 🟢
 * 9. 2XX Response Present for GET Operation  🟢
 * 10. At Least One Operation Level Tag 🟢
 * 11. Parameters Should Be in Order 🔴
 * 12. Add Descriptions to the API Components - SKIPPED
 * 13. Add Contact Information - SKIPPED
 * 14. Reuse Components to Avoid Huge OpenAPI Files 🟡
 */
const APIMATIC_SDK_ISSUES = [
  "oas3-api-servers", // Rec 1
  // NOTE: I decided to skip Info Title, Server Variable Name, Schema Title,
  // Schema Property Name, Security Scope Name, and Summary because I viewed
  // them as less important or too hard to do
  "apimatic-operationId-max-length", // Rec 2
  "apimatic-parameter-name-max-length", // Rec 2
  "apimatic-header-name-max-length", // Rec 2
  "apimatic-component-name-max-length", // Rec 2
  // NOTE: There might be more properties that make use of schemas that I do not
  // cover below
  "apimatic-no-inline-response-schema", // Rec 3
  "apimatic-no-inline-parameter-schema", // Rec 3,
  "apimatic-no-inline-request-body-schema", // Rec 3
  "oas3-valid-schema-example", // Rec 4 & 5
  "apimatic-security-defined", // Rec 6
  "operation-operationId", // Rec 7
  "operation-operationId-unique", // Rec 8
  "operation-operationId-valid-in-url", // Rec 8
  "operation-success-response", // Rec 9
  "operation-tags", // Rec 10
  "oas3-unused-component", // Rec 14
];

export const SDK_ISSUES = [
  "redocly-components-invalid-map-name",
  "typed-enum",
  "no-ambiguous-paths",
  ...COMMON_CRITICAL_ISSUES,
  ...APIMATIC_SDK_ISSUES,
];

export function getSdkGenerationRating(issues: SpectralReport) {
  return getLengthNormalizedSdkGenerationRating(issues, 1);
}

export function getSdkGenerationIssues(issues: SpectralReport) {
  return issues
    .filter(
      (issue) =>
        typeof issue.code === "string" && SDK_ISSUES.includes(issue.code),
    )
    .sort(
      (a, b) => a.severity - b.severity || a.message.localeCompare(b.message),
    );
}

export function getLengthNormalizedSdkGenerationRating(
  issues: SpectralReport,
  length: number,
) {
  let totalDelta = 0;
  const sdkGenerationIssues = issues.filter((issue) => {
    if (typeof issue.code === "string" && SDK_ISSUES.includes(issue.code)) {
      totalDelta = totalDelta + getScoreDelta(issue.severity);
      return true;
    }
    return false;
  });
  return {
    sdkGenerationScore: Math.max(0, 100 - totalDelta / length),
    sdkGenerationIssues,
  };
}
