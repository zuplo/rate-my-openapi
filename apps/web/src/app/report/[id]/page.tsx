import { notFound } from "next/navigation";

import ScoreMeter from "@/components/ScoreMeter";

import ShareButton from "@/components/ShareButton";
import DynamicBackground from "@/components/DynamicBackground";
import { FullReport } from "./full-report";
import { SimpleReport, getSimpleReport } from "./simple-report-request";
import ReportSummary from "./report-summary";
import { FeedbackPopover } from "./feedback-popup";

const HeroScore = async ({ simpleReport }: { simpleReport: SimpleReport }) => {
  return (
    <>
      <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-6 rounded-lg bg-white p-6 shadow-md md:mt-32 md:flex-row md:justify-around md:p-10">
        <div className="relative">
          <ScoreMeter score={simpleReport.score} />
        </div>
        <div className="w-full text-center">
          <h1 className="mb-10 text-2xl">
            {simpleReport?.title} {simpleReport?.version}
          </h1>
          <ShareButton type="light" />
        </div>
      </div>
      <DynamicBackground score={simpleReport.score} />
    </>
  );
};

const ReportPage = async ({ params }: { params: { id: string } }) => {
  const simpleReport = await getSimpleReport(params.id);

  if (!simpleReport) {
    notFound();
  }

  const fileExtension = simpleReport?.fileExtension;
  return (
    <>
      <HeroScore simpleReport={simpleReport} />
      {simpleReport.shortSummary && simpleReport.longSummary ? (
        <ReportSummary
          shortSummary={simpleReport.shortSummary}
          longSummary={simpleReport.longSummary}
          score={simpleReport.score}
        />
      ) : null}
      <FullReport reportId={params.id} fileExtension={fileExtension} />
      <FeedbackPopover />
    </>
  );
};

export default ReportPage;
