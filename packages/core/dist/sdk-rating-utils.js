"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLengthNormalizedSdkGenerationRating = exports.getSdkGenerationIssues = exports.getSdkGenerationRating = exports.SDK_ISSUES = void 0;
const rating_utils_1 = require("./rating-utils");
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
 * 14. Reuse Components to Avoid Huge OpenAPI Files - SKIPPED
 */
const APIMATIC_SDK_ISSUES = [
    "oas3-api-servers",
    // NOTE: I decided to skip Info Title, Server Variable Name, Schema Title,
    // Schema Property Name, Security Scope Name, and Summary because I viewed
    // them as  less important or too hard to do
    "apimatic-operationId-max-length",
    "apimatic-parameter-name-max-length",
    "apimatic-header-name-max-length",
    "apimatic-component-name-max-length",
    // NOTE: There might be more properties that make use of schemas that I do not
    // cover below
    "apimatic-no-inline-response-schema",
    "apimatic-no-inline-parameter-schema",
    "apimatic-no-inline-request-body-schema",
    "oas3-valid-schema-example",
    "apimatic-security-defined",
    "operation-operationId",
    "operation-operationId-unique",
    "operation-operationId-valid-in-url",
    "operation-success-response",
    "operation-tags", // Rec 10
];
exports.SDK_ISSUES = [...APIMATIC_SDK_ISSUES];
const getSdkGenerationRating = (issues) => {
    return (0, exports.getLengthNormalizedSdkGenerationRating)(issues, 1);
};
exports.getSdkGenerationRating = getSdkGenerationRating;
const getSdkGenerationIssues = (issues) => {
    return issues.filter((issue) => typeof issue.code === "string" && exports.SDK_ISSUES.includes(issue.code));
};
exports.getSdkGenerationIssues = getSdkGenerationIssues;
const getLengthNormalizedSdkGenerationRating = (issues, length) => {
    let totalDelta = 0;
    const sdkGenerationIssues = issues.filter((issue) => {
        if (typeof issue.code === "string" && exports.SDK_ISSUES.includes(issue.code)) {
            totalDelta = totalDelta + (0, rating_utils_1.getScoreDelta)(issue.severity);
            return true;
        }
        return false;
    });
    return {
        sdkGenerationScore: Math.max(0, 100 - totalDelta / length),
        sdkGenerationIssues,
    };
};
exports.getLengthNormalizedSdkGenerationRating = getLengthNormalizedSdkGenerationRating;
//# sourceMappingURL=sdk-rating-utils.js.map