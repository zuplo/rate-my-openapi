"use client";

import { DetailedScoreLoading } from "@/components/DetailedScoreSection/Loading";
import { useEffect, useState } from "react";
import ScoreDetailsSection from "@/components/DetailedScoreSection";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import { RatingExamples } from "@/components/RatingExamples";

// import { type RatingOutput } from "@rate-my-openapi/core";
type RatingOutput = any;

export const FullReport = ({ reportId }: { reportId: string }) => {
  const [report, setReport] = useState<RatingOutput | null>(null);
  useEffect(() => {
    const getReport = async () => {
      const downloadUrlRequest = await fetch(
        (process.env.NEXT_PUBLIC_API_URL as string) + `/report/${reportId}`,
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

    getReport();
  }, []);
  if (report === null)
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
      <h2 className="mx-auto my-16 max-w-xl text-center text-4xl font-extrabold md:text-7xl">
        Here is your
        <br />
        breakdown
      </h2>
      <div className="mb-10">
        {report?.docsScore ? (
          <ScoreDetailsSection
            title="Documentation"
            score={report?.docsScore}
            issues={report?.docsIssues}
          />
        ) : (
          <div className="mb-10 h-[630px] animate-pulse rounded-lg bg-slate-200 shadow-md md:h-[312px]" />
        )}
        {report?.completenessScore && (
          <ScoreDetailsSection
            title="Completeness"
            score={report?.completenessScore}
            issues={report?.completenessIssues}
          />
        )}
        {report?.sdkGenerationScore && (
          <ScoreDetailsSection
            title="SDK Generation"
            score={report?.sdkGenerationScore}
            issues={report?.sdkGenerationIssues}
          />
        )}
        {report?.securityScore && (
          <ScoreDetailsSection
            title="Security"
            score={report?.securityScore}
            issues={report?.securityIssues}
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
