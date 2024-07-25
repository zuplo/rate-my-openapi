export interface SyncReportArguments {
  dir: string;
  "api-key": string;
  filename: string;
  output: "default" | "json";
  "max-warnings": string;
  "max-errors": string;
  "minimum-score": string;
}

export interface APIResponse {
  results: {
    simpleReport: {
      version: string;
      title: string;
      fileExtension: "json" | "yaml";
      docsScore: number;
      completenessScore: number;
      score: number;
      securityScore: number;
      sdkGenerationScore: number;
      shortSummary: string;
      longSummary: string;
    };
    fullReport: {
      issues: {
        code: string;
        message: string;
        path: string[];
        severity: number;
        source: string;
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
      }[];
    };
  };
  reportId: string;
  reportUrl: string;
}
