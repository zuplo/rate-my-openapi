import { COMMON_CRITICAL_ISSUES } from "./common-rating-utils";
import { SpectralReport } from "./interfaces";
import { getScoreDelta } from "./rating-utils";

// Sort of a subset of https://github.com/stoplightio/spectral-owasp-ruleset/blob/main/src/ruleset.ts
// With some rules dropped because I didn't think they were very useful or
// actionable.
export const SECURITY_ISSUES = [
  ...COMMON_CRITICAL_ISSUES,
  "apimatic-security-defined",
  "owasp-security-hosts-https-oas3",
  "owasp-constrained-additionalProperties",
  "owasp-integer-format",
  "owasp-integer-limit",
  "owasp-string-restricted",
  "owasp-string-limit",
  "owasp-array-limit",
  "owasp-define-error-responses-429",
  "owasp-rate-limit-retry-after",
  "owasp-rate-limit",
  "owasp-define-error-responses-500",
  "owasp-define-error-responses-401",
  "owasp-define-error-validation",
  "owasp-protection-global-safe",
  "owasp-jwt-best-practices",
  "owasp-auth-insecure-schemes",
  "owasp-no-credentials-in-url",
  "owasp-no-api-keys-in-url",
  "owasp-no-http-basic",
  "owasp-no-numeric-ids",
  "owasp:api1:2019-no-numeric-ids",
  "owasp:api2:2019-no-http-basic",
  "operation-4xx-response",
  "owasp:api3:2019-define-error-responses-401",
  "owasp:api3:2019-define-error-responses-500",
  "owasp:api4:2019-rate-limit",
  "owasp:api4:2019-rate-limit-retry-after",
  "owasp:api4:2019-rate-limit-responses-429",
  "owasp:api7:2019-security-hosts-https-oas3",
];

export function getSecurityRating(issues: SpectralReport) {
  return getLengthNormalizedSecurityRating(issues, 1);
}

export function getSecurityIssues(issues: SpectralReport) {
  return issues
    .filter(
      (issue) =>
        typeof issue.code === "string" && SECURITY_ISSUES.includes(issue.code),
    )
    .sort(
      (a, b) => a.severity - b.severity || a.message.localeCompare(b.message),
    );
}

export function getLengthNormalizedSecurityRating(
  issues: SpectralReport,
  length: number,
) {
  let totalDelta = 0;
  const securityIssues = issues.filter((issue) => {
    if (
      typeof issue.code === "string" &&
      SECURITY_ISSUES.includes(issue.code)
    ) {
      totalDelta = totalDelta + getScoreDelta(issue.severity);
      return true;
    }
    return false;
  });
  return {
    securityScore: Math.max(0, 100 - totalDelta / length),
    securityIssues,
  };
}
