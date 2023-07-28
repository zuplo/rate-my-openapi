"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLengthNormalizedDocsRating = exports.getDocsIssues = exports.getDocsRating = exports.DOCS_ISSUES = void 0;
const rating_utils_1 = require("./rating-utils");
exports.DOCS_ISSUES = [
    "oas3-schema",
    "oas3-valid-schema-example",
    "operation-4xx-response",
    "operation-operationId-valid-in-url",
    "operation-success-response",
    "operation-operationId",
    "operation-operationId-unique",
    "oas3-host-not-example",
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
];
const getDocsRating = (issues) => {
    return (0, exports.getLengthNormalizedDocsRating)(issues, 1);
};
exports.getDocsRating = getDocsRating;
const getDocsIssues = (issues) => {
    return issues.filter((issue) => typeof issue.code === "string" && exports.DOCS_ISSUES.includes(issue.code));
};
exports.getDocsIssues = getDocsIssues;
const getLengthNormalizedDocsRating = (issues, length) => {
    let totalDelta = 0;
    const docsIssues = issues.filter((issue) => {
        if (typeof issue.code === "string" && exports.DOCS_ISSUES.includes(issue.code)) {
            totalDelta = totalDelta + (0, rating_utils_1.getScoreDelta)(issue.severity);
            return true;
        }
        return false;
    });
    return { docsScore: Math.max(0, 100 - totalDelta / length), docsIssues };
};
exports.getLengthNormalizedDocsRating = getLengthNormalizedDocsRating;
//# sourceMappingURL=docs-rating-utils.js.map