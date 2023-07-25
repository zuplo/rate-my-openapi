import { notFound } from "next/navigation";

import ScoreDetailsSection from "@/components/DetailedScoreSection";
import ScoreMeter from "@/components/ScoreMeter";

import getApiFile from "@/requests/getApiFile";
import getReport from "@/requests/getReport";

const ReportPage = async ({ params }: { params: { id: string } }) => {
  const apiFileData = getApiFile(params.id);
  const reportData = getReport(params.id);

  const [apiFile, report] = await Promise.all([apiFileData, reportData]);

  if (!apiFile || !report) {
    notFound();
  }

  return (
    <>
      <p className="mx-auto mb-16 mt-32 max-w-xl text-center text-7xl">
        Lorem ipsum dolor! Consectetur adipiscing elit!
      </p>

      <div className="mx-auto mb-10 flex max-w-3xl items-center justify-between rounded-lg bg-white p-10 shadow-md">
        <div className="pr-10">
          <h1 className=" text-2xl">
            {apiFile.title} Version {apiFile.version}
          </h1>
          <a
            className="mb-10 block underline"
            target="_blank"
            href={apiFile.url}
          >
            Link to API Document
          </a>
          <p className="text-lg">
            Your API spec scored {report.score} out of 100
          </p>
          <p className="text-lg">
            ##th percentile - Your rank ##th out of #### OpenAPI docs rated.
          </p>
        </div>
        <ScoreMeter score={report.score} />
      </div>

      <h2 className="mb-10 text-center text-4xl">Your rating in details</h2>
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
    </>
  );
};

export default ReportPage;
