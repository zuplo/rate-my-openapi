"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLengthNormalizedSecurityRating = exports.getSecurityIssues = exports.getSecurityRating = exports.SECURITY_ISSUES = void 0;
const rating_utils_1 = require("./rating-utils");
// Sort of a subset of https://github.com/stoplightio/spectral-owasp-ruleset/blob/main/src/ruleset.ts
// With some rules dropped because I didn't think they were very useful or
// actionable.
exports.SECURITY_ISSUES = [
    'apimatic-security-defined',
    'owasp:api1:2019-no-numeric-ids',
    'owasp:api2:2019-no-http-basic',
    'operation-4xx-response',
    'owasp:api3:2019-define-error-responses-401',
    'owasp:api3:2019-define-error-responses-500',
    'owasp:api4:2019-rate-limit',
    'owasp:api4:2019-rate-limit-retry-after',
    'owasp:api4:2019-rate-limit-responses-429',
    'owasp:api7:2019-security-hosts-https-oas3'
];
const getSecurityRating = (issues) => {
    return (0, exports.getLengthNormalizedSecurityRating)(issues, 1);
};
exports.getSecurityRating = getSecurityRating;
const getSecurityIssues = (issues) => {
    return issues.filter((issue) => typeof issue.code === "string" && exports.SECURITY_ISSUES.includes(issue.code));
};
exports.getSecurityIssues = getSecurityIssues;
const getLengthNormalizedSecurityRating = (issues, length) => {
    let totalDelta = 0;
    const securityIssues = issues.filter((issue) => {
        if (typeof issue.code === "string" && exports.SECURITY_ISSUES.includes(issue.code)) {
            totalDelta = totalDelta + (0, rating_utils_1.getScoreDelta)(issue.severity);
            return true;
        }
        return false;
    });
    return { securityScore: Math.max(0, 100 - totalDelta / length), securityIssues };
};
exports.getLengthNormalizedSecurityRating = getLengthNormalizedSecurityRating;
//# sourceMappingURL=security-rating-utils.js.map