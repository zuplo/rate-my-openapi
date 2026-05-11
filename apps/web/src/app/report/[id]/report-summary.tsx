"use client";

import getScoreHeadline from "@/utils/get-score-headline";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { useState } from "react";

type ReportSummaryProps = {
  shortSummary: string;
  longSummary: string;
  score: number;
};

const ReportSummary = ({
  shortSummary,
  longSummary,
  score,
}: ReportSummaryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const scoreHeadline = getScoreHeadline(score);
  return (
    <>
      <div className="mx-auto my-10 max-w-3xl text-center md:my-14">
        <h2 className="font-display text-fg text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
          {scoreHeadline.headline}
        </h2>
        <p className="text-fg-muted mt-3 text-base">{scoreHeadline.sub}</p>
      </div>
      <div className="card my-8 p-6 md:p-8">
        <div className="mb-4 flex items-center gap-2">
          <span className="tag tag-info is-caps">Summary</span>
        </div>
        <p className="text-fg-secondary text-[15px] leading-relaxed whitespace-pre-wrap">
          {shortSummary}
        </p>
        {isExpanded && (
          <div className="border-border mt-6 border-t pt-6">
            <h4 className="font-display text-fg text-base font-semibold">
              Advice
            </h4>
            <p className="text-fg-secondary mt-2 text-[15px] leading-relaxed whitespace-pre-wrap">
              {longSummary}
            </p>
          </div>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-sm mt-5 -ml-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>{isExpanded ? "Hide advice" : "Show advice"}</span>
          {isExpanded ? (
            <CaretUp size={14} weight="regular" />
          ) : (
            <CaretDown size={14} weight="regular" />
          )}
        </button>
      </div>
    </>
  );
};

export default ReportSummary;
