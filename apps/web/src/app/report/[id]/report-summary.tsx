"use client";

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
  return (
    <div className="my-10 flex flex-col	overflow-hidden rounded-lg bg-white p-8 shadow-md md:p-10">
      <h3
        className={`mb-6 font-roboto-mono text-xl font-bold uppercase ${scoreTextColor}`}
      >
        Summary
      </h3>
      <p className="whitespace-pre-wrap text-base">
        {isExpanded ? longSummary : shortSummary}
      </p>
      <button
        className="button-transparent mt-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "Hide advice" : "Show advice"}
      </button>
    </div>
  );
};

export default ReportSummary;
