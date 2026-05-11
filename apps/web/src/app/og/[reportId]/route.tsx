import { getSimpleReport } from "@/app/report/[id]/simple-report-request";
import { ImageResponse } from "next/og";

export const runtime = "edge";

const scoreColors = (score: number): { text: string; bg: string } => {
  if (score >= 80) return { text: "#10b981", bg: "#ecfdf5" };
  if (score >= 50) return { text: "#b45309", bg: "#fffbeb" };
  if (score > 0) return { text: "#e11d48", bg: "#ffe4e6" };
  return { text: "#6b7280", bg: "#f3f4f6" };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await params;
  const report = await getSimpleReport(reportId);
  const fontData = await fetch(
    new URL("../../../../assets/Roboto-Bold.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  if (!report) {
    console.error("Report not found", reportId);
    return new Response("Not found", { status: 404 });
  }

  const { text, bg } = scoreColors(report.score);

  return new ImageResponse(
    (
      <div style={{ display: "flex" }}>
        <div tw="flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            tw="absolute z-[-1]"
            width="1200"
            height="630"
            alt="Rate My OpenAPI"
            src="https://cdn.zuplo.com/assets/517742cf-0c08-448c-8f81-18b03c3a7144.png"
          />
          <div tw="flex ml-100 mt-30 items-center">
            <div
              style={{ fontFamily: "Roboto" }}
              tw="flex text-white text-6xl text-wrap break-words w-100 h-30 text-center items-center justify-center mr-10"
            >
              {report.title} - {report.version}
            </div>
            <div
              tw="flex items-center justify-center rounded-full text-9xl font-bold h-80 w-80"
              style={{
                color: text,
                backgroundColor: bg,
                border: "8px solid #ffffff",
              }}
            >
              {report.score}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Roboto",
          data: fontData,
          style: "normal",
        },
      ],
    },
  );
}
