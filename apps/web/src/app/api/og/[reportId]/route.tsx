import { ImageResponse } from "next/server";
import { getSimpleReport } from "../../../report/[id]/simple-report-request";
import classNames from "classnames";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: { reportId: string } },
) {
  const report = await getSimpleReport(params.reportId);
  if (!report) {
    console.error("Report not found", params.reportId);
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          fontFamily: "Roboto, sans-serif",
        }}
      >
        <div tw="flex ">
          <img
            tw="absolute z-[-1]"
            width="1200"
            height="630"
            src={`https://cdn.zuplo.com/assets/517742cf-0c08-448c-8f81-18b03c3a7144.png`}
          />
          <div tw="flex ml-80 mt-30 items-center">
            <div tw="flex text-white text-6xl text-wrap break-words w-100 h-30 font-extrabold text-center items-center justify-center mr-15">
              {report.title} - {report.version}
            </div>
            <div
              tw={classNames(
                "flex items-center justify-center rounded-full text-base text-white h-80 w-80 border-8	text-9xl font-bold border-white",
                {
                  "border-green-500 text-green-500 bg-green-200":
                    report.score > 66,
                  "border-yellow-500 text-yellow-500 bg-yellow-200":
                    report.score > 33 && report.score <= 66,
                  "border-red-500 text-red-500 bg-red-200": report.score <= 33,
                },
              )}
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
    },
  );
}
