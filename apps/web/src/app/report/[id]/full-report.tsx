"use client";

import ScoreDetailsSection from "@/components/DetailedScoreSection";
import { DetailedScoreLoading } from "@/components/DetailedScoreSection/Loading";
import { RatingExamples } from "@/components/RatingExamples";
import ShareButton from "@/components/ShareButton";
import { type RatingOutput } from "@rate-my-openapi/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NEXT_PUBLIC_API_URL } from "../../../utils/env";

export const FullReport = ({
  reportId,
  fileExtension,
}: {
  reportId: string;
  fileExtension: "json" | "yaml";
}) => {
  const [report, setReport] = useState<RatingOutput | null>(null);
  const [openapi, setOpenapi] = useState<string>();
  useEffect(() => {
    const getReport = async () => {
      const downloadUrlRequest = await fetch(
        `${NEXT_PUBLIC_API_URL}/report/${reportId}`,
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

      setReport(downloadUrlJson);
    };

    const getOpenapi = async () => {
      const downloadUrlRequest = await fetch(
        `${NEXT_PUBLIC_API_URL}/file/${reportId}.${fileExtension}`,
        {
          next: {
            // 1 day
            revalidate: 60 * 60 * 24,
          },
        },
      );

      if (downloadUrlRequest.status !== 200) {
        console.log("API Error getting OpenAPI file", {
          status: downloadUrlRequest.status,
          content: await downloadUrlRequest.text(),
        });
        return null;
      }

      const downloadUrlJson = await downloadUrlRequest.text();

      setOpenapi(downloadUrlJson);
    };

    getReport();
    getOpenapi();
  }, [fileExtension, reportId]);

  if (report === null || openapi === undefined)
    return (
      <>
        <h2 className="mx-auto my-16 max-w-xl animate-pulse text-center text-4xl font-extrabold text-gray-400 md:text-7xl">
          Loading
          <br />
          full report
        </h2>
        <DetailedScoreLoading title="Documentation" />
        <DetailedScoreLoading title="Completeness" />
        <DetailedScoreLoading title="SDK Generation" />
        <DetailedScoreLoading title="Security" />
      </>
    );

  return (
    <>
      <div className="mb-10">
        {report?.docsScore ? (
          <ScoreDetailsSection
            title="Documentation"
            score={report?.docsScore}
            issues={report?.docsIssues}
            openapi={openapi}
            fileExtension={fileExtension}
          />
        ) : (
          <div className="mb-10 h-[630px] animate-pulse rounded-lg bg-slate-200 shadow-md md:h-[312px]" />
        )}
        {report?.completenessScore && (
          <ScoreDetailsSection
            title="Completeness"
            score={report?.completenessScore}
            issues={report?.completenessIssues}
            openapi={openapi}
            fileExtension={fileExtension}
          />
        )}
        {report?.sdkGenerationScore && (
          <ScoreDetailsSection
            title="SDK Generation"
            score={report?.sdkGenerationScore}
            issues={report?.sdkGenerationIssues}
            openapi={openapi}
            fileExtension={fileExtension}
          />
        )}
        {report?.securityScore && (
          <ScoreDetailsSection
            title="Security"
            score={report?.securityScore}
            issues={report?.securityIssues}
            openapi={openapi}
            fileExtension={fileExtension}
          />
        )}
      </div>
      <div className="mb-10 mt-20 flex w-full flex-col md:flex-row md:items-center md:justify-center">
        <ShareButton className="mb-4 text-lg md:mb-0 md:mr-4" />
        <Link href="/" className="button-light text-lg">
          Rate another OpenAPI spec
        </Link>
      </div>
      <RatingExamples>
        <p className="m-5 text-lg text-gray-400">See how other APIs scored</p>
      </RatingExamples>
    </>
  );
};
