import { ISpectralDiagnostic } from "@stoplight/spectral-core";

export type CategoryStatistic = {
  "categoryName": string;
  "categoryId": string;
  "numIssues": number;
  "score": number;
  "warnings": number;
  "errors": number;
  "info": number;
  "hints": number;
};

export type VacuumResult = {
  "message": string;
  "range": {
    "start": {
      "line": number;
      "character": number;
    };
    "end": {
      "line": number;
      "character": number;
    };
  };
  "path": string;
  "ruleId": string;
  "ruleSeverity": "info" | "warn" | "error";
};

export type VacuumReport = {
  generated: string;
  specInfo: {
    "type": string;
    "version": string;
    "format": string;
    "fileType": string;
  };
  statistics: {
    "filesizeKb": number;
    "filesizeBytes": number;
    "specType": "openapi";
    "specFormat": "oas3";
    "version": "3.1.0";
    "references": number;
    "schemas": number;
    "parameters": number;
    "links": number;
    "paths": number;
    "operations": number;
    "tags": number;
    "enums": number;
    "security": number;
    "overallScore": number;
    "totalErrors": number;
    "totalWarnings": number;
    "totalInfo": number;
    categoryStatistics: CategoryStatistic[];
  };
  resultSet: {
    "warningCount": number;
    "errorCount": number;
    "infoCount": number;
    results: VacuumResult[];
  };
};

export type SpectralReport = ISpectralDiagnostic[];

export type Rating = {
  score: number;
  issues: SpectralReport;
};

export type PathRating = {
  score: number;
  issues: SpectralReport;
  get?: Rating;
  put?: Rating;
  post?: Rating;
  delete?: Rating;
  options?: Rating;
  head?: Rating;
  patch?: Rating;
  trace?: Rating;
};

export type PathsRating = {
  score: number;
  issues: SpectralReport;
  [key: string]: PathRating | number | SpectralReport;
};

export type ComponentsRating = {
  score: number;
  issues: SpectralReport;
  schemas?: ComponentRating;
  responses?: ComponentRating;
  parameters?: ComponentRating;
  examples?: ComponentRating;
  requestBodies?: ComponentRating;
  headers?: ComponentRating;
  securitySchemes?: ComponentRating;
  links?: ComponentRating;
  callbacks?: ComponentRating;
  pathItems?: ComponentRating;
};

export type ComponentRating = {
  score: number;
  issues: SpectralReport;
  // Will just be Rating in practice
  [key: string]: Rating | number | SpectralReport;
};

export type RatingOutput = {
  score: number;
  issues: SpectralReport;
  paths: PathsRating;
  info: Rating;
  security: Rating;
  tags: Rating;
  servers: Rating;
  components: ComponentsRating;
};
