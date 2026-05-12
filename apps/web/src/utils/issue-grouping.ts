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

export type GroupedIssue = {
  code: string;
  severity: number;
  message: string;
  occurrences: Issue[];
};

export const HTTP_METHODS = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
  "trace",
]);

// Build a friendly operation label from a Spectral issue path.
// e.g. ["paths", "/users/{id}", "get", "responses", "401"] -> "GET /users/{id}"
// Falls back to the joined path when no HTTP verb is found.
export function describeOccurrence(issue: Issue): string {
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

export function groupIssues(issues: Issue[]): GroupedIssue[] {
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
