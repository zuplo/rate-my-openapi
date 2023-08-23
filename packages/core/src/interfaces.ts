import { ISpectralDiagnostic } from "@stoplight/spectral-core";

export type SpectralReport = ISpectralDiagnostic[];

export interface Rating {
  score: number;
  issues: SpectralReport;
  docsScore: number;
  docsIssues: SpectralReport;
  completenessScore: number;
  completenessIssues: SpectralReport;
  sdkGenerationScore: number;
  sdkGenerationIssues: SpectralReport;
  securityScore: number;
  securityIssues: SpectralReport;
}

export interface PathRating extends Rating {
  get?: Rating;
  put?: Rating;
  post?: Rating;
  delete?: Rating;
  options?: Rating;
  head?: Rating;
  patch?: Rating;
  trace?: Rating;
}

export interface PathsRating extends Rating {
  // Will just be PathRating in practice
  [key: string]: PathRating | number | SpectralReport;
}

export interface ComponentsRating extends Rating {
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
}

export interface ComponentRating extends Rating {
  // Will just be Rating in practice
  [key: string]: Rating | number | SpectralReport;
}

export interface RatingOutput extends Rating {
  paths: PathsRating;
  info: Rating;
  security: Rating;
  tags: Rating;
  servers: Rating;
  components: ComponentsRating;
  processingErrors: string[];
}
