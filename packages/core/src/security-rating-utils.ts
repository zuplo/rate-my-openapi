import { SpectralReport } from "./interfaces";
import { getScoreDelta } from "./rating-utils";
import { COMMON_CRITICAL_ISSUES } from "./common-rating-utils";

// Sort of a subset of https://github.com/stoplightio/spectral-owasp-ruleset/blob/main/src/ruleset.ts
// With some rules dropped because I didn't think they were very useful or
// actionable.
export const SECURITY_ISSUES = [
  ...COMMON_CRITICAL_ISSUES,
  "apimatic-security-defined",
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

export const getSecurityRating = (issues: SpectralReport) => {
  return getLengthNormalizedSecurityRating(issues, 1);
};

export const getSecurityIssues = (issues: SpectralReport) => {
  return issues
    .filter(
      (issue) =>
        typeof issue.code === "string" && SECURITY_ISSUES.includes(issue.code),
    )
    .sort(
      (a, b) => a.severity - b.severity || a.message.localeCompare(b.message),
    );
};

export const getLengthNormalizedSecurityRating = (
  issues: SpectralReport,
  length: number,
) => {
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
};
