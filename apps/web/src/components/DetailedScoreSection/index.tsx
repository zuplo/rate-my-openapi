"use client";

import classNames from "classnames";
import AnimatedScore from "../AnimatedScore";

import getScoreTextColor from "@/utils/get-score-test-color";
import { useState } from "react";
import { useModal } from "react-modal-hook";
import IssueModal from "../IssueModal";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";

export type Issue = {
  code: string | number;
  message: string;
  severity: number;
  range: {
    start: {
      line: number;
      character: number;
    };
    end: {
      line: number;
      character: number;
    };
  };
};

const PAGE_LENGTH = 3;
const INITIAL_LENGTH = 3;

const SEVERITY_LEVEL_MAP: Record<number, string> = {
  0: "error",
  1: "warn",
  2: "info",
  3: "hint",
};

const getSeverityTextColor = (severity: number) =>
  classNames({
    "text-red-500": severity === 0,
    "text-yellow-500": severity === 1,
    "text-blue-500": severity === 2,
    "text-green-500": severity === 3,
  });

const DetailedScoreSection = ({
  title,
  score,
  issues,
  openapi,
  fileExtension,
}: {
  title: string;
  score: number;
  issues: Issue[];
  openapi: string;
  fileExtension: "json" | "yaml";
}) => {
  const [page, setPage] = useState(0);
  const scoreTextColor = getScoreTextColor(score);
  const titleSlug = title.toLowerCase().replace(" ", "-");
  const issueCount = issues.length;
  const totalPages = Math.ceil((issueCount - INITIAL_LENGTH) / PAGE_LENGTH);
  const [issueToView, setIssueToView] = useState<Issue | undefined>();

  const handleViewClick = (issue: Issue) => {
    setIssueToView(issue);
    showModal();
  };

  const [showModal, hideModal] = useModal(() => {
    return (
      <IssueModal
        openapi={openapi}
        fileExtension={fileExtension}
        onClose={() => {
          hideModal();
        }}
        issue={issueToView!}
      />
    );
  }, [issueToView]);

  return (
    <div className="mb-10 flex flex-col	overflow-hidden rounded-lg bg-white p-8 shadow-md md:flex-row md:items-start md:p-10 md:pl-0">
      <div className="mb-6 flex basis-1/4 flex-col items-center justify-center px-4 md:mb-0">
        <h3
          className={`mb-6 font-roboto-mono text-xl font-bold uppercase ${scoreTextColor}`}
        >
          {title}
        </h3>
        <AnimatedScore score={score} className="text-7xl" id={titleSlug} />
      </div>
      <div className="basis-3/4">
        <table className="grid min-w-full border-collapse grid-cols-[minmax(70px,0.7fr)_minmax(100px,4fr)] gap-2 gap-y-3">
          <thead className="contents text-left font-bold uppercase">
            <tr className="contents text-gray-400">
              <th>Severity</th>
              <th>Issue</th>
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
                    onClick={() => handleViewClick(issue)}
                    className={`font-bold uppercase ${getSeverityTextColor(
                      issue.severity,
                    )} cursor-pointer hover:underline`}
                  >
                    {SEVERITY_LEVEL_MAP[issue.severity]}
                  </td>
                  <td
                    className="flex cursor-pointer flex-wrap items-center gap-1 md:flex-nowrap"
                    onClick={() => handleViewClick(issue)}
                  >
                    <div className="flex flex-row items-center">
                      <span className="block overflow-hidden break-words hover:underline">
                        {issue.message}
                      </span>
                      <div className="rounded p-1 hover:bg-gray-200">
                        <DocumentMagnifyingGlassIcon className="h-4 w-auto" />
                      </div>
                    </div>
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
                className="button-transparent mb-4 text-sm md:mb-0 md:mr-4"
              >
                Show {PAGE_LENGTH} more issues
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
        {issueCount > INITIAL_LENGTH && page >= totalPages && (
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

export default DetailedScoreSection;
