"use client";

import getScoreHeadline from "@/utils/get-score-headline";
import getScoreTextColor from "@/utils/get-score-test-color";
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
  const scoreTextColor = getScoreTextColor(score);
  const scoreHeadline = getScoreHeadline(score);
  return (
    <>
      <h2 className="mx-auto my-16 max-w-xl text-center text-4xl font-extrabold md:text-7xl">
        {scoreHeadline.headline}
        <div className="mt-2 text-xl font-bold text-gray-500">
          {scoreHeadline.sub}
        </div>
      </h2>
      <div className="my-10 flex flex-col	overflow-hidden rounded-lg bg-white p-8 shadow-md md:p-10">
        <h3
          className={`mb-6 font-roboto-mono text-xl font-bold uppercase ${scoreTextColor}`}
        >
          Summary
        </h3>
        <p className="whitespace-pre-wrap text-base">{shortSummary}</p>
        {isExpanded ? (
          <>
            <p className="mt-4 text-lg">Advice</p>
            <p className="mt-2 whitespace-pre-wrap text-base">{longSummary}</p>
          </>
        ) : null}
        <button
          className="button-transparent mt-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Hide advice" : "Show advice"}
        </button>
      </div>
    </>
  );
};

export default ReportSummary;
