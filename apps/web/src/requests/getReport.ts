import { ISpectralDiagnostic } from "@stoplight/spectral-core";

// import { type RatingOutput } from "@rate-my-openapi/core";
type RatingOutput = any;

type Issue = {
  message: string;
  severity: number;
  count: number;
};

const formatIssues = (issues: ISpectralDiagnostic[]) => {
  const groupedIssues: Issue[] = [];

  issues.forEach((issue, i) => {
    if (/^(?:Parameter|Request Body|Response) schema/i.test(issue.message)) {
      issues[i].message = issue.message.replace(/schema:.*?\/schema/, "schema");
    }
    if (issue.message.startsWith("Schema for")) {
      issues[i].message = issue.message.replace(/for.*`/, "");
    }
    if (
      issue.message.startsWith("Field `") ||
      issue.message.startsWith("Tags for")
    ) {
      issues[i].message = issue.message.replace(/at path.*`/, "");
    }
    if (issue.message.startsWith("Missing example")) {
      issues[i].message = issue.message.replace(
        /for.*`/,
        "for property on component",
      );
    }
    if (issue.message.startsWith("the parameter")) {
      issues[i].message = issue.message.replace(
        /the parameter.*`/,
        "Parameter",
      );
    }
    if (issue.message.endsWith("must be shorter than 50 characters")) {
      issues[i].message =
        "Component schema key must be shorter than 50 characters";
    }
    if (issue.message.startsWith("Example `")) {
      if (issue.message.includes("(line")) {
        issues[i].message = issue.message.replace(/`.*\)/, "");
      } else if (issue.message.includes("not valid")) {
        issues[i].message = issue.message.replace(/`.*is not/, "is not");
      }
    }
    if (issue.message.startsWith("Example for property")) {
      issues[i].message = issue.message.replace(/`.*?`/, "");
    }
    if (/^the `(?:delete|get|patch|post|put)` operation/i.test(issue.message)) {
      issues[i].message = issue.message.replace(/path `.*`,/, "contains a tag");
    }

    issues[i].message = issue.message.replace(/`(.*?)`/g, "<code>$1</code>");
  });

  issues.forEach((issue) => {
    if (!groupedIssues.find(({ message }) => message === issue.message)) {
      groupedIssues.push({
        message: issue.message,
        severity: issue.severity,
        count: issues.filter(({ message }) => message === issue.message).length,
      });
    }
  });

  const sortedIssues = groupedIssues.sort(
    (a, b) =>
      a.severity - b.severity ||
      b.count - a.count ||
      a.message.localeCompare(b.message),
  );

  return sortedIssues;
};

const getReport = async (id: string): Promise<RatingOutput | undefined> => {
  const downloadUrlRequest = await fetch(
    (process.env.NEXT_PUBLIC_API_URL as string) + `/report/${id}`,
  );

  if (downloadUrlRequest.status !== 200) {
    return null;
  }

  const downloadUrlJson = await downloadUrlRequest.json();

  const contentRequest = await fetch(downloadUrlJson.publicUrl);

  if (contentRequest.status !== 200) {
    return null;
  }

  const contentJson = await contentRequest.json();

  const data = (({
    score,
    docsScore,
    completenessScore,
    sdkGenerationScore,
    securityScore,
    docsIssues,
    completenessIssues,
    sdkGenerationIssues,
    securityIssues,
  }) => ({
    score,
    docsScore,
    completenessScore,
    sdkGenerationScore,
    securityScore,
    docsIssues: formatIssues(docsIssues),
    completenessIssues: formatIssues(completenessIssues),
    sdkGenerationIssues: formatIssues(sdkGenerationIssues),
    securityIssues: formatIssues(securityIssues),
    fileExtension: contentJson?.issues?.[0]?.source?.split(".").pop(),
  }))(contentJson);

  return data;
};

export default getReport;
