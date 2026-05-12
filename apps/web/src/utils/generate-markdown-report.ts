import type { RatingOutput } from "@rate-my-openapi/core";

import type { SimpleReport } from "@/types/report";
import {
  describeOccurrence,
  groupIssues,
  type Issue,
} from "@/utils/issue-grouping";

const SEVERITY_LABEL: Record<number, string> = {
  0: "Error",
  1: "Warning",
  2: "Info",
  3: "Hint",
};

function renderCategory(
  title: string,
  score: number,
  issues: Issue[] | undefined,
): string {
  const lines: string[] = [];
  lines.push(`## ${title} — ${score} / 100`);
  lines.push("");
  const list = issues ?? [];
  if (list.length === 0) {
    lines.push("_No issues found._");
    lines.push("");
    return lines.join("\n");
  }
  const groups = groupIssues(list);
  lines.push(
    `${list.length} total occurrence${list.length === 1 ? "" : "s"} across ${groups.length} unique issue${groups.length === 1 ? "" : "s"}.`,
  );
  lines.push("");
  for (const group of groups) {
    const sev = SEVERITY_LABEL[group.severity] ?? "Info";
    lines.push(
      `### ${group.message} \`(${group.code})\` — ${sev} × ${group.occurrences.length}`,
    );
    lines.push("");
    for (const occ of group.occurrences) {
      const line = occ.range.start.line + 1;
      lines.push(`- ${describeOccurrence(occ)} — L${line}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function generateMarkdownReport(
  simple: SimpleReport,
  full: RatingOutput,
): string {
  const parts: string[] = [];
  parts.push(`# ${simple.title}`);
  parts.push("");
  if (simple.version) {
    parts.push(`**Version:** \`${simple.version}\``);
    parts.push("");
  }
  parts.push(`**Overall score:** ${simple.score} / 100`);
  parts.push("");
  parts.push("| Category | Score |");
  parts.push("| --- | --- |");
  parts.push(`| Documentation | ${simple.docsScore} / 100 |`);
  parts.push(`| Completeness | ${simple.completenessScore} / 100 |`);
  parts.push(`| SDK Generation | ${simple.sdkGenerationScore} / 100 |`);
  parts.push(`| Security | ${simple.securityScore} / 100 |`);
  parts.push("");

  if (simple.shortSummary) {
    parts.push("## Summary");
    parts.push("");
    parts.push(simple.shortSummary);
    parts.push("");
  }

  if (simple.longSummary) {
    parts.push("## Advice");
    parts.push("");
    parts.push(simple.longSummary);
    parts.push("");
  }

  parts.push(renderCategory("Documentation", full.docsScore, full.docsIssues));
  parts.push(
    renderCategory(
      "Completeness",
      full.completenessScore,
      full.completenessIssues,
    ),
  );
  parts.push(
    renderCategory(
      "SDK Generation",
      full.sdkGenerationScore,
      full.sdkGenerationIssues,
    ),
  );
  parts.push(
    renderCategory("Security", full.securityScore, full.securityIssues),
  );

  return (
    parts
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trimEnd() + "\n"
  );
}
