import { ISpectralDiagnostic } from "@stoplight/spectral-core";

export type CategoryStatistic = {
  categoryName: string;
  categoryId: string;
  numIssues: number;
  score: number;
  warnings: number;
  errors: number;
  info: number;
  hints: number;
};

export type VacuumResult = {
  message: string;
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
  path: string;
  ruleId: string;
  ruleSeverity: "info" | "warn" | "error";
};

export type VacuumReport = {
  generated: string;
  specInfo: {
    type: string;
    version: string;
    format: string;
    fileType: string;
  };
  statistics: {
    filesizeKb: number;
    filesizeBytes: number;
    specType: "openapi";
    specFormat: "oas3";
    version: "3.1.0";
    references: number;
    schemas: number;
    parameters: number;
    links: number;
    paths: number;
    operations: number;
    tags: number;
    enums: number;
    security: number;
    overallScore: number;
    totalErrors: number;
    totalWarnings: number;
    totalInfo: number;
    categoryStatistics: CategoryStatistic[];
  };
  resultSet: {
    warningCount: number;
    errorCount: number;
    infoCount: number;
    results: VacuumResult[];
  };
};

export type SpectralReport = ISpectralDiagnostic[];

export type OperationRating = {
  score: number;
  issues: SpectralReport;
};

export type PathRating = {
  score: number;
  issues: SpectralReport;
  get?: OperationRating;
  put?: OperationRating;
  post?: OperationRating;
  delete?: OperationRating;
  options?: OperationRating;
  head?: OperationRating;
  patch?: OperationRating;
  trace?: OperationRating;
};

export type RatingOutput = {
  score: number;
  issues: SpectralReport;
  paths: Record<string, PathRating>;
};
