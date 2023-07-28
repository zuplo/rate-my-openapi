"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLengthNormalizedCompletenessRating = exports.getCompletenessIssues = exports.getCompletenessRating = exports.COMPLETENESS_ISSUES = void 0;
const rating_utils_1 = require("./rating-utils");
exports.COMPLETENESS_ISSUES = [
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
];
const getCompletenessRating = (issues) => {
    return (0, exports.getLengthNormalizedCompletenessRating)(issues, 1);
};
exports.getCompletenessRating = getCompletenessRating;
const getCompletenessIssues = (issues) => {
    return issues.filter((issue) => typeof issue.code === "string" && exports.COMPLETENESS_ISSUES.includes(issue.code));
};
exports.getCompletenessIssues = getCompletenessIssues;
const getLengthNormalizedCompletenessRating = (issues, length) => {
    let totalDelta = 0;
    const completenessIssues = issues.filter((issue) => {
        if (typeof issue.code === "string" && exports.COMPLETENESS_ISSUES.includes(issue.code)) {
            totalDelta = totalDelta + (0, rating_utils_1.getScoreDelta)(issue.severity);
            return true;
        }
        return false;
    });
    return { completenessScore: Math.max(0, 100 - totalDelta / length), completenessIssues };
};
exports.getLengthNormalizedCompletenessRating = getLengthNormalizedCompletenessRating;
//# sourceMappingURL=completeness-rating-utils.js.map