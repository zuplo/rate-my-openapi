import { ISpectralDiagnostic } from "@stoplight/spectral-core";

// import { type RatingOutput } from "@rate-my-openapi/core";
type RatingOutput = any;

type Issue = {
  message: string;
  severity: number;
  count: number;
};

const groupIssues = (issues: ISpectralDiagnostic[]) => {
  const groupedIssues: Issue[] = [];

  issues.forEach((issue) => {
    if (!groupedIssues.find(({ message }) => message === issue.message)) {
      groupedIssues.push({
        message: issue.message,
        severity: issue.severity,
        count: issues.filter(({ message }) => message === issue.message).length,
      });
    }
  });

  const formattedIssues = groupedIssues.map((issue) => ({
    ...issue,
    message: issue.message.replace(/`(.*?)`/g, "<code>$1</code>"),
  }));

  const sortedIssues = formattedIssues.sort(
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
    docsIssues: groupIssues(docsIssues),
    completenessIssues: groupIssues(completenessIssues),
    sdkGenerationIssues: groupIssues(sdkGenerationIssues),
    securityIssues: groupIssues(securityIssues),
    fileExtension: contentJson?.issues?.[0]?.source?.split(".").pop(),
  }))(contentJson);

  return data;
};

export default getReport;
