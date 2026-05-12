import type { RatingOutput, SpectralReport } from "@rate-my-openapi/core";

type SimpleReport = {
  docsScore: number;
  completenessScore: number;
  score: number;
  securityScore: number;
  sdkGenerationScore: number;
  fileExtension: "json" | "yaml";
  title: string;
  version: string;
  shortSummary?: string;
  longSummary?: string;
};

type Issue = SpectralReport[number];

type GroupedIssue = {
  code: string;
  severity: number;
  message: string;
  occurrences: Issue[];
};

const SEVERITY_LABEL: Record<number, string> = {
  0: "Error",
  1: "Warning",
  2: "Info",
  3: "Hint",
};

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
