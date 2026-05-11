"use client";

import ScoreDetailsSection from "@/components/DetailedScoreSection";
import { DetailedScoreLoading } from "@/components/DetailedScoreSection/Loading";
import { RatingExamples } from "@/components/RatingExamples";
import ShareButton from "@/components/ShareButton";
import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { type RatingOutput } from "@rate-my-openapi/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL } from "../../../utils/env";

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
      const downloadUrlRequest = await fetch(`${API_URL}/reports/${reportId}`, {
        next: { revalidate: 60 * 60 * 24 },
      });

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
        `${API_URL}/files/${reportId}.${fileExtension}`,
        { next: { revalidate: 60 * 60 * 24 } },
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
        <h2 className="font-display text-fg-faint mx-auto my-12 max-w-xl text-center text-2xl font-semibold md:text-3xl">
          Loading full report…
        </h2>
        <DetailedScoreLoading title="Documentation" />
        <DetailedScoreLoading title="Completeness" />
        <DetailedScoreLoading title="SDK Generation" />
        <DetailedScoreLoading title="Security" />
      </>
    );

  return (
    <>
      <div className="mt-10 mb-8">
        {report?.docsScore ? (
          <ScoreDetailsSection
            title="Documentation"
            score={report?.docsScore}
            issues={report?.docsIssues}
            openapi={openapi}
            reportName={`${reportId}.${fileExtension}`}
            fileExtension={fileExtension}
          />
        ) : (
          <DetailedScoreLoading title="Documentation" />
        )}
        {report?.completenessScore && (
          <ScoreDetailsSection
            title="Completeness"
            score={report?.completenessScore}
            issues={report?.completenessIssues}
            openapi={openapi}
            reportName={`${reportId}.${fileExtension}`}
            fileExtension={fileExtension}
          />
        )}
        {report?.sdkGenerationScore && (
          <ScoreDetailsSection
            title="SDK Generation"
            score={report?.sdkGenerationScore}
            issues={report?.sdkGenerationIssues}
            openapi={openapi}
            reportName={`${reportId}.${fileExtension}`}
            fileExtension={fileExtension}
          />
        )}
        {report?.securityScore && (
          <ScoreDetailsSection
            title="Security"
            score={report?.securityScore}
            issues={report?.securityIssues}
            openapi={openapi}
            reportName={`${reportId}.${fileExtension}`}
            fileExtension={fileExtension}
          />
        )}
      </div>
      <div className="mt-10 mb-12 flex w-full flex-col items-center justify-center gap-3 md:flex-row">
        <ShareButton type="dark" />
        <Link href="/" className="btn btn-outlined">
          <ArrowCounterClockwise size={16} weight="regular" />
          <span>Rate another OpenAPI spec</span>
        </Link>
      </div>
      <RatingExamples>See how other APIs scored</RatingExamples>
    </>
  );
};
