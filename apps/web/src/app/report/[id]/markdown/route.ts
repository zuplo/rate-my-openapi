import { NextResponse } from "next/server";
import type { RatingOutput } from "@rate-my-openapi/core";

import { generateMarkdownReport } from "@/utils/generate-markdown-report";
import { getServerApiUrl } from "@/utils/server-api-url";

const REVALIDATE_SECONDS = 60 * 60 * 24;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const apiUrl = await getServerApiUrl();

  const [simpleRes, fullRes] = await Promise.all([
    fetch(`${apiUrl}/reports/${id}/simplified`, {
      next: { revalidate: REVALIDATE_SECONDS },
    }),
    fetch(`${apiUrl}/reports/${id}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    }),
  ]);

  if (simpleRes.status !== 200 || fullRes.status !== 200) {
    return new NextResponse("Report not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const simple = await simpleRes.json();
  const full = (await fullRes.json()) as RatingOutput;
  const markdown = generateMarkdownReport(simple, full);

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": `public, max-age=${REVALIDATE_SECONDS}, s-maxage=${REVALIDATE_SECONDS}`,
    },
  });
}
