import { notFound } from "next/navigation";

import ScoreDetailsSection from "@/components/DetailedScoreSection";
import ScoreMeter from "@/components/ScoreMeter";

import getApiFile from "@/requests/getApiFile";
import getReport from "@/requests/getReport";
import { Suspense } from "react";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";

const ApiFileInfo = async ({
  id,
  fileExtension,
}: {
  id: string;
  fileExtension: string;
}) => {
  const apiFile = await getApiFile({
    id,
    fileExtension,
  });

  return (
    <>
      <h1 className="text-2xl">
        {apiFile?.title} {apiFile?.version}
      </h1>
      <a
        className="flex items-center justify-center underline"
        target="_blank"
        href={apiFile?.url}
      >
        <span className="mr-1">Spec</span>
        <ArrowTopRightOnSquareIcon height={16} width={16} />
      </a>
    </>
  );
};

const ReportPage = async ({ params }: { params: { id: string } }) => {
  const report = await getReport(params.id);

  if (!report) {
    notFound();
  }

  return (
    <>
      <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-6 rounded-lg bg-white p-6 shadow-md md:mt-32 md:flex-row md:justify-around md:p-10">
        <div className="relative">
          <ScoreMeter score={report.score} />
        </div>
        <div className="text-center md:pr-10">
          <Suspense>
            <ApiFileInfo id={params.id} fileExtension={report.fileExtension} />
          </Suspense>
        </div>
      </div>

      <h2 className="mx-auto my-16 max-w-xl text-center text-4xl font-extrabold md:text-7xl">
        Here is your
        <br />
        breakdown
      </h2>
      <div className="mb-10">
        {report?.docsScore && (
          <ScoreDetailsSection
            title="Documentation"
            score={report?.docsScore}
            issues={report?.docsIssues}
          />
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
      <div className="mb-10 flex w-full flex-col md:flex-row md:items-center md:justify-center">
        <ShareButton className="mb-4 md:mb-0 md:mr-4" />
        <Link href="/" className="button-light">
          Rate your OpenAPI spec
        </Link>
      </div>
    </>
  );
};

export default ReportPage;
