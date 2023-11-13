import { NEXT_PUBLIC_API_URL } from "../../../utils/env";

export type SimpleReport = {
  docsScore: number;
  completenessScore: number;
  score: number;
  securityScore: number;
  sdkGenerationScore: number;
  fileExtension: "json" | "yaml";
  title: string;
  version: string;
  shortSummary?: string;
  longSummary?: string;
};

export const getSimpleReport = async (
  id: string,
): Promise<SimpleReport | null> => {
  const downloadUrlRequest = await fetch(
    `${NEXT_PUBLIC_API_URL}/report/${id}/simplified`,
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

  return await downloadUrlRequest.json();
};
