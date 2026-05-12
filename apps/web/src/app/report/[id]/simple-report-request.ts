import "server-only";

import type { SimpleReport } from "@/types/report";
import { getServerApiUrl } from "@/utils/server-api-url";

export type { SimpleReport };

export const getSimpleReport = async (
  id: string,
): Promise<SimpleReport | null> => {
  const apiUrl = await getServerApiUrl();
  const downloadUrlRequest = await fetch(`${apiUrl}/reports/${id}/simplified`, {
    next: {
      // 1 day
      revalidate: 60 * 60 * 24,
    },
  });

  if (downloadUrlRequest.status !== 200) {
    console.log("API Error getting simplified report", {
      status: downloadUrlRequest.status,
      content: await downloadUrlRequest.text(),
    });
    return null;
  }

  return await downloadUrlRequest.json();
};
