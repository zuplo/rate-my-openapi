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

export const getReport = async (id: string): Promise<RatingOutput | null> => {
  const start = performance.now();
  const downloadUrlRequest = await fetch(
    (process.env.NEXT_PUBLIC_API_URL as string) + `/report/${id}`,
    {
      next: {
        // 1 day
        revalidate: 60 * 60 * 24,
      },
    },
  );

  if (downloadUrlRequest.status !== 200) {
    console.log("API Error getting report", {
      status: downloadUrlRequest.status,
      content: await downloadUrlRequest.text(),
    });
    return null;
  }

  const downloadUrlJson = await downloadUrlRequest.json();

  const contentRequest = await fetch(downloadUrlJson.publicUrl);

  if (contentRequest.status !== 200) {
    console.log("Google Cloud Error getting report", {
      status: contentRequest.status,
      content: await contentRequest.text(),
    });
    return null;
  }

  const contentJson = await contentRequest.json();
  const end = performance.now();

  console.log("Full Report fetched in", end - start, "ms");

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
  }))(contentJson);

  return data;
};

export type SimpleReport = {
  docsScore: number;
  completenessScore: number;
  score: number;
  securityScore: number;
  sdkGenerationScore: number;
  fileExtension: "json" | "yaml";
  title: string;
  version: string;
};

export const getSimpleReport = async (
  id: string,
): Promise<SimpleReport | null> => {
  const start = performance.now();
  const downloadUrlRequest = await fetch(
    (process.env.NEXT_PUBLIC_API_URL as string) + `/report/${id}/simplified`,
    {
      next: {
        // 1 day
        revalidate: 60 * 60 * 24,
      },
    },
  );

  if (downloadUrlRequest.status !== 200) {
    console.log("API Error getting simplified report", {
      status: downloadUrlRequest.status,
      content: await downloadUrlRequest.text(),
    });
    return null;
  }

  const downloadUrlJson = await downloadUrlRequest.json();

  const contentRequest = await fetch(downloadUrlJson.publicUrl);

  const end = performance.now();

  console.log("Simplified Report fetched in", end - start, "ms");

  if (contentRequest.status !== 200) {
    console.log("Google Cloud Error getting simplified report", {
      status: contentRequest.status,
      content: await contentRequest.text(),
    });
    return null;
  }

  const contentJson = await contentRequest.json();

  return contentJson;
};
