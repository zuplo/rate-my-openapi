"use client";

import getScoreTextColor from "@/utils/get-score-test-color";
import {
  CaretDown,
  CaretRight,
  FileMagnifyingGlass,
  Info,
  Lightning,
  WarningCircle,
  WarningOctagon,
  type Icon,
} from "@phosphor-icons/react";
import classNames from "classnames";
import { useMemo, useState } from "react";
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

type GroupedIssue = {
  code: string;
  severity: number;
  message: string;
  occurrences: Issue[];
};

const INITIAL_GROUPS = 5;
const PAGE_GROUPS = 5;
const AUTO_EXPAND_THRESHOLD = 3;

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

// Build a friendly operation label from a Spectral issue path.
// e.g. ["paths", "/users/{id}", "get", "responses", "401"] -> "GET /users/{id}"
// Falls back to the joined path when no HTTP verb is found.
const HTTP_METHODS = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
  "trace",
]);

function describeOccurrence(issue: Issue): string {
  const parts = issue.path.map(String);
  const pathsIdx = parts.indexOf("paths");
  if (pathsIdx >= 0 && pathsIdx + 2 < parts.length) {
    const route = parts[pathsIdx + 1];
    const method = parts[pathsIdx + 2];
    if (HTTP_METHODS.has(method.toLowerCase())) {
      return `${method.toUpperCase()} ${route}`;
    }
  }
  return parts.join(".") || "(root)";
}

function groupIssues(issues: Issue[]): GroupedIssue[] {
  const map = new Map<string, GroupedIssue>();
  for (const issue of issues) {
    const code = String(issue.code);
    const existing = map.get(code);
    if (existing) {
      existing.occurrences.push(issue);
      // Keep the most-severe representative for the group header (lower = worse).
      if (issue.severity < existing.severity) {
        existing.severity = issue.severity;
        existing.message = issue.message;
      }
    } else {
      map.set(code, {
        code,
        severity: issue.severity,
        message: issue.message,
        occurrences: [issue],
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.severity !== b.severity) return a.severity - b.severity;
    if (a.occurrences.length !== b.occurrences.length) {
      return b.occurrences.length - a.occurrences.length;
    }
    return a.message.localeCompare(b.message);
  });
}

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
  const scoreTextColor = getScoreTextColor(score);
  const titleSlug = title.toLowerCase().replace(" ", "-");

  const groups = useMemo(() => groupIssues(issues), [issues]);
  const groupCount = groups.length;
  const issueCount = issues.length;

  const [page, setPage] = useState(0);
  const totalPages = Math.max(
    0,
    Math.ceil((groupCount - INITIAL_GROUPS) / PAGE_GROUPS),
  );
  const visibleCount = page
    ? PAGE_GROUPS * page + INITIAL_GROUPS
    : INITIAL_GROUPS;
  const visibleGroups = groups.slice(0, visibleCount);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const isExpanded = (code: string, occurrenceCount: number) => {
    if (code in expanded) return expanded[code];
    return occurrenceCount <= AUTO_EXPAND_THRESHOLD;
  };
  const toggle = (code: string, occurrenceCount: number) => {
    setExpanded((prev) => ({
      ...prev,
      [code]: !isExpanded(code, occurrenceCount),
    }));
  };

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
                <th className="text-fg-faint w-[100px] px-5 py-2.5 text-right text-[11px] font-semibold tracking-[0.05em] uppercase">
                  Count
                </th>
                <th className="text-fg-faint w-[60px] px-5 py-2.5 text-[11px] font-semibold tracking-[0.05em] uppercase" />
              </tr>
            </thead>
            <tbody>
              {visibleGroups.map((group, groupIndex) => {
                const expandedNow = isExpanded(
                  group.code,
                  group.occurrences.length,
                );
                const single = group.occurrences.length === 1;
                const Caret = expandedNow ? CaretDown : CaretRight;
                const handleHeaderActivate = () => {
                  if (single) {
                    handleViewClick(group.occurrences[0]);
                  } else {
                    toggle(group.code, group.occurrences.length);
                  }
                };
                return [
                  <tr
                    key={`${titleSlug}-group-${groupIndex}`}
                    role="button"
                    tabIndex={0}
                    aria-expanded={single ? undefined : expandedNow}
                    aria-label={
                      single
                        ? `View issue: ${group.message}`
                        : `${expandedNow ? "Collapse" : "Expand"} ${
                            group.occurrences.length
                          } occurrences of ${group.message}`
                    }
                    onClick={handleHeaderActivate}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleHeaderActivate();
                      }
                    }}
                    className="border-bg-muted text-fg-secondary hover:bg-bg-subtle focus-visible:bg-bg-subtle focus-visible:outline-accent cursor-pointer border-b transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2"
                  >
                    <td className="px-5 py-3 align-top">
                      <SeverityTag severity={group.severity} />
                    </td>
                    <td className="px-5 py-3 align-top">
                      <span className="text-fg block break-words">
                        {group.message}
                      </span>
                      <span className="text-fg-muted mt-1 block font-mono text-xs">
                        {group.code}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right align-top">
                      {single ? (
                        <span className="text-fg-faint text-xs">—</span>
                      ) : (
                        <span className="badge-numeric badge-neutral">
                          × {group.occurrences.length}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right align-top">
                      <span
                        aria-hidden="true"
                        className="btn btn-ghost btn-icon"
                      >
                        {single ? (
                          <FileMagnifyingGlass size={16} weight="regular" />
                        ) : (
                          <Caret size={16} weight="regular" />
                        )}
                      </span>
                    </td>
                  </tr>,
                  !single &&
                    expandedNow &&
                    group.occurrences.map((occ, occIndex) => {
                      const line = occ.range.start.line + 1;
                      const where = describeOccurrence(occ);
                      const onActivate = () => handleViewClick(occ);
                      return (
                        <tr
                          key={`${titleSlug}-group-${groupIndex}-occ-${occIndex}`}
                          role="button"
                          tabIndex={0}
                          aria-label={`View occurrence at ${where}, line ${line}`}
                          onClick={onActivate}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onActivate();
                            }
                          }}
                          className="border-bg-muted text-fg-muted hover:bg-bg-subtle focus-visible:bg-bg-subtle focus-visible:outline-accent bg-bg-subtle/40 cursor-pointer border-b transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2"
                        >
                          <td className="px-5 py-2 align-top" />
                          <td className="px-5 py-2 align-top">
                            <div className="flex flex-col gap-1 pl-4">
                              <span className="text-fg-secondary font-mono text-xs">
                                {where}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-2 text-right align-top">
                            <span className="badge-numeric badge-neutral">
                              L{line}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right align-top">
                            <span
                              aria-hidden="true"
                              className="btn btn-ghost btn-icon"
                            >
                              <FileMagnifyingGlass size={14} weight="regular" />
                            </span>
                          </td>
                        </tr>
                      );
                    }),
                ];
              })}
            </tbody>
          </table>
        </div>
      )}

      {groupCount > INITIAL_GROUPS && (
        <div className="border-border bg-bg-subtle flex flex-col items-start gap-2 border-t px-5 py-4 md:flex-row md:items-center md:justify-between">
          <span className="text-fg-muted text-xs">
            Showing{" "}
            <span className="text-fg font-semibold">
              {visibleGroups.length}
            </span>{" "}
            of <span className="text-fg font-semibold">{groupCount}</span>{" "}
            unique issues ({issueCount} total occurrences)
          </span>
          <div className="flex flex-wrap gap-2">
            {page < totalPages && groupCount > PAGE_GROUPS + INITIAL_GROUPS && (
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                className="btn btn-ghost btn-sm"
              >
                Show {PAGE_GROUPS} more
              </button>
            )}
            {page < totalPages && (
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                className="btn btn-outlined btn-sm"
              >
                Show all {groupCount}
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
