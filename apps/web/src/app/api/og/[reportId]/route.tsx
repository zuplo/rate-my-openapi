import { ImageResponse } from "next/server";
import getReport from "@/requests/getReport";
import classNames from "classnames";
import getApiFile from "@/requests/getApiFile";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: { reportId: string } },
) {
  const report = await getReport(params.reportId);
  const apiFile = await getApiFile({
    id: params.reportId,
    fileExtension: report.fileExtension,
  });

  return new ImageResponse(
    (
      // Modified based on https://tailwindui.com/components/marketing/sections/cta-sections
      <div
        style={{
          display: "flex",
          backgroundColor: "white",
        }}
      >
        <div tw="flex flex-col w-full h-full items-center justify-center bg-white font-bold">
          <div tw="flex w-full">
            <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-around p-8">
              <h2 tw="flex flex-col text-6xl font-bold tracking-tight text-gray-900 text-left">
                <span tw="text-indigo-600">OpenAPI Rating for</span>
                <span tw="text-pink-500">{apiFile?.title}</span>
                <span tw="mt-5">Get yours at</span>
                <span>ratemyopenapi.com</span>
              </h2>
              <div tw="flex md:mt-0">
                <div
                  tw={classNames(
                    "flex items-center justify-center rounded-full text-base font-medium text-white h-54 w-54 border-8	text-6xl font-bold",
                    {
                      "border-green-500 text-green-500 bg-green-200":
                        report.score > 66,
                      "border-yellow-500 text-yellow-500 bg-yellow-200":
                        report.score > 33 && report.score <= 66,
                      "border-red-500 text-red-500 bg-red-200":
                        report.score <= 33,
                    },
                  )}
                >
                  {report.score}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 400,
    },
  );
}