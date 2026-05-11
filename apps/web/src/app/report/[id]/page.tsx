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
      <div className="card mx-auto mt-2 flex max-w-3xl flex-col items-center gap-6 p-6 md:flex-row md:items-center md:justify-between md:gap-10 md:p-8">
        <div className="shrink-0">
          <ScoreMeter score={simpleReport.score} />
        </div>
        <div className="flex flex-1 flex-col items-center gap-4 text-center md:items-start md:text-left">
          <div className="flex flex-col gap-1">
            <span className="text-fg-faint text-xs font-medium tracking-[0.05em] uppercase">
              Report
            </span>
            <h1 className="font-display text-fg text-2xl leading-tight font-semibold tracking-tight md:text-3xl">
              {simpleReport?.title}
            </h1>
            {simpleReport?.version && (
              <span className="text-fg-muted font-mono text-sm">
                {simpleReport.version}
              </span>
            )}
          </div>
          <ShareButton type="light" />
        </div>
      </div>
      <DynamicBackground score={simpleReport.score} />
    </>
  );
};

const ReportPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const simpleReport = await getSimpleReport(id);

  if (!simpleReport) {
    notFound();
  }

  const fileExtension = simpleReport?.fileExtension;
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6">
      <HeroScore simpleReport={simpleReport} />
      {simpleReport.shortSummary && simpleReport.longSummary ? (
        <ReportSummary
          shortSummary={simpleReport.shortSummary}
          longSummary={simpleReport.longSummary}
          score={simpleReport.score}
        />
      ) : null}
      <FullReport reportId={id} fileExtension={fileExtension} />
      <FeedbackPopover />
    </div>
  );
};

export default ReportPage;
