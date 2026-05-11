"use client";

import getScoreTextColor from "@/utils/get-score-test-color";
import {
  FileMagnifyingGlass,
  Info,
  Lightning,
  WarningCircle,
  WarningOctagon,
  type Icon,
} from "@phosphor-icons/react";
import classNames from "classnames";
import { useState } from "react";
import { useModal } from "react-modal-hook";
import IssueModal from "../IssueModal";

export type Issue = {
  code: string | number;
  message: string;
  severity: number;
  path: (string | number)[];
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
};

const PAGE_LENGTH = 5;
const INITIAL_LENGTH = 5;

type SeverityKey = "error" | "warning" | "info" | "hint";

const SEVERITY_LEVEL_MAP: Record<number, SeverityKey> = {
  0: "error",
  1: "warning",
  2: "info",
  3: "hint",
};

const SEVERITY_LABEL: Record<SeverityKey, string> = {
  error: "Error",
  warning: "Warn",
  info: "Info",
  hint: "Hint",
};

const SEVERITY_TAG_CLASS: Record<SeverityKey, string> = {
  error: "tag-error",
  warning: "tag-warning",
  info: "tag-info",
  hint: "tag-neutral",
};

const SEVERITY_ICON: Record<SeverityKey, Icon> = {
  error: WarningOctagon,
  warning: WarningCircle,
  info: Info,
  hint: Lightning,
};

const SeverityTag = ({ severity }: { severity: number }) => {
  const key = SEVERITY_LEVEL_MAP[severity] ?? "info";
  const Icon = SEVERITY_ICON[key];
  return (
    <span className={`tag ${SEVERITY_TAG_CLASS[key]} is-caps`}>
      <Icon size={10} weight="regular" />
      <span>{SEVERITY_LABEL[key]}</span>
    </span>
  );
};

const DetailedScoreSection = ({
  title,
  score,
  issues,
  reportName,
  openapi,
  fileExtension,
}: {
  title: string;
  score: number;
  issues: Issue[];
  reportName: string;
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
        onClose={() => hideModal()}
        reportName={reportName}
        issue={issueToView!}
      />
    );
  }, [issueToView]);

  const visibleIssues = issues.slice(
    0,
    page ? PAGE_LENGTH * page + INITIAL_LENGTH : INITIAL_LENGTH,
  );

  return (
    <section className="card mb-6 overflow-hidden p-0">
      <header className="border-border flex flex-col items-start justify-between gap-3 border-b p-5 md:flex-row md:items-center md:p-6">
        <div className="flex flex-col">
          <span className="text-fg-faint text-xs font-medium tracking-[0.05em] uppercase">
            Category
          </span>
          <h3 className="font-display text-fg text-xl leading-tight font-semibold">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-fg-faint text-xs font-medium tracking-[0.05em] uppercase">
            Score
          </span>
          <span
            className={classNames(
              "font-display text-4xl leading-none font-bold tracking-tight",
              scoreTextColor,
            )}
          >
            {score}
          </span>
          <span className="text-fg-faint text-base font-medium">/ 100</span>
        </div>
      </header>

      {issueCount === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <span className="bg-success-bg text-success grid h-10 w-10 place-items-center rounded-full">
            <Lightning size={18} weight="regular" />
          </span>
          <p className="font-display text-fg text-base font-semibold">
            No issues found
          </p>
          <p className="text-fg-muted text-sm">Nothing to fix here. Nice.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-border bg-bg-subtle border-b text-left">
                <th className="text-fg-faint w-[120px] px-5 py-2.5 text-[11px] font-semibold tracking-[0.05em] uppercase">
                  Severity
                </th>
                <th className="text-fg-faint px-5 py-2.5 text-[11px] font-semibold tracking-[0.05em] uppercase">
                  Issue
                </th>
                <th className="text-fg-faint w-[60px] px-5 py-2.5 text-[11px] font-semibold tracking-[0.05em] uppercase" />
              </tr>
            </thead>
            <tbody>
              {visibleIssues.map((issue, index: number) => (
                <tr
                  key={`${titleSlug}-table-row-${index}`}
                  onClick={() => handleViewClick(issue)}
                  className="border-bg-muted text-fg-secondary hover:bg-bg-subtle cursor-pointer border-b transition-colors last:border-b-0"
                >
                  <td className="px-5 py-3 align-top">
                    <SeverityTag severity={issue.severity} />
                  </td>
                  <td className="px-5 py-3 align-top">
                    <span className="text-fg block break-words">
                      {issue.message}
                    </span>
                    {typeof issue.code !== "undefined" && (
                      <span className="text-fg-muted mt-1 block font-mono text-xs">
                        {issue.code}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right align-top">
                    <span className="btn btn-ghost btn-icon">
                      <FileMagnifyingGlass size={16} weight="regular" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {issueCount > INITIAL_LENGTH && (
        <div className="border-border bg-bg-subtle flex flex-col items-start gap-2 border-t px-5 py-4 md:flex-row md:items-center md:justify-between">
          <span className="text-fg-muted text-xs">
            Showing{" "}
            <span className="text-fg font-semibold">
              {visibleIssues.length}
            </span>{" "}
            of <span className="text-fg font-semibold">{issueCount}</span>{" "}
            issues
          </span>
          <div className="flex flex-wrap gap-2">
            {page < totalPages && issueCount > PAGE_LENGTH + INITIAL_LENGTH && (
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                className="btn btn-ghost btn-sm"
              >
                Show {PAGE_LENGTH} more
              </button>
            )}
            {page < totalPages && (
              <button
                type="button"
                onClick={() => setPage(Math.ceil(issueCount / PAGE_LENGTH))}
                className="btn btn-outlined btn-sm"
              >
                Show all {issueCount}
              </button>
            )}
            {page >= totalPages && (
              <button
                type="button"
                onClick={() => setPage(0)}
                className="btn btn-ghost btn-sm"
              >
                Collapse
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default DetailedScoreSection;
