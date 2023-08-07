import { notFound } from "next/navigation";

import ScoreDetailsSection from "@/components/DetailedScoreSection";
import ScoreMeter from "@/components/ScoreMeter";

import getApiFile from "@/requests/getApiFile";
import getReport from "@/requests/getReport";
import { Suspense } from "react";

import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import { RatingExamples } from "@/components/RatingExamples";

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
    <h1 className="text-2xl">
      {apiFile?.title} {apiFile?.version}
    </h1>
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

export default ReportPage;
