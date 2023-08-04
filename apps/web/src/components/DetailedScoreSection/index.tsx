"use client";

import classNames from "classnames";
import AnimatedScore from "../AnimatedScore";

import { useState } from "react";
import getScoreTextColor from "@/utils/getScoreTextColor";

type Issue = {
  message: string;
  severity: number;
  count: number;
};

const PAGE_LENGTH = 3;
const INITIAL_LENGTH = 3;

const SEVERITY_LEVEL_MAP: Record<number, string> = {
  0: "critical",
  1: "high",
  2: "mid",
  3: "low",
};

const getSeverityTextColor = (severity: number) =>
  classNames({
    "to-critical-light from-critical-dark": severity === 0,
    "to-high-light from-high-dark": severity === 1,
    "to-mid-light from-mid-dark": severity === 2,
    "to-low-light from-low-dark": severity === 3,
  });

const ScoreDetailsSection = ({
  title,
  score,
  issues,
}: {
  title: string;
  score: number;
  issues: Issue[];
}) => {
  const [page, setPage] = useState(0);
  const scoreTextColor = getScoreTextColor(score);
  const titleSlug = title.toLowerCase().replace(" ", "-");
  const issueCount = issues.length;
  const totalPages = Math.ceil((issueCount - INITIAL_LENGTH) / PAGE_LENGTH);

  return (
    <div className="mb-10 flex flex-col	overflow-hidden rounded-lg bg-white p-8 shadow-md md:flex-row md:items-start md:p-10 md:pl-0">
      <div className="mb-6 flex basis-1/4 flex-col items-center justify-center md:mb-0">
        <h3
          className={`text-gradient mb-6 font-roboto-mono text-xl font-bold uppercase ${scoreTextColor}`}
        >
          {title}
        </h3>
        <AnimatedScore score={score} className="text-7xl" id={titleSlug} />
      </div>
      <div className="basis-3/4">
        <table className="grid min-w-full border-collapse grid-cols-[minmax(70px,0.7fr)_minmax(100px,4fr)] gap-2">
          <thead className="contents text-left font-bold uppercase">
            <tr className="contents text-gray-400">
              <th>Severity</th>
              <th>Suggestion</th>
            </tr>
          </thead>
          <tbody className="contents">
            {issues
              .slice(
                0,
                page ? PAGE_LENGTH * page + INITIAL_LENGTH : INITIAL_LENGTH,
              )
              .map((issue, index: number) => (
                <tr
                  className="contents"
                  key={`${titleSlug}-table-row-${index}`}
                >
                  <td
                    className={`text-gradient font-bold uppercase ${getSeverityTextColor(
                      issue.severity,
                    )}`}
                  >
                    {SEVERITY_LEVEL_MAP[issue.severity]}
                  </td>
                  <td className="flex flex-wrap gap-1 md:flex-nowrap">
                    <span
                      className="block overflow-hidden break-words"
                      dangerouslySetInnerHTML={{
                        __html: issue.message,
                      }}
                    ></span>
                    {issue.count > 1 && (
                      <span className="shrink-0 text-gray-400">
                        ({issue.count} occurances)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {issueCount > INITIAL_LENGTH && page < totalPages && (
          <div className="mt-10 flex flex-col md:flex-row">
            {issueCount > PAGE_LENGTH + INITIAL_LENGTH && (
              <button
                onClick={() => setPage(page + 1)}
                className="button-dark mb-4 md:mb-0 md:mr-4"
              >
                Show {PAGE_LENGTH} more
              </button>
            )}
            <button
              onClick={() => setPage(Math.ceil(issueCount / PAGE_LENGTH))}
              className="button-transparent"
            >
              Show all {issueCount} issues
            </button>
          </div>
        )}
        {page >= totalPages && (
          <button
            onClick={() => setPage(0)}
            className="button-dark mt-10 w-full md:mr-4 md:w-auto"
          >
            Collapse issues
          </button>
        )}
      </div>
    </div>
  );
};

export default ScoreDetailsSection;
