import { NextResponse } from "next/server";
import type { RatingOutput } from "@rate-my-openapi/core";

import { API_URL } from "@/utils/env";
import { generateMarkdownReport } from "@/utils/generate-markdown-report";

const REVALIDATE_SECONDS = 60 * 60 * 24;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [simpleRes, fullRes] = await Promise.all([
    fetch(`${API_URL}/reports/${id}/simplified`, {
      next: { revalidate: REVALIDATE_SECONDS },
    }),
    fetch(`${API_URL}/reports/${id}`, {
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
