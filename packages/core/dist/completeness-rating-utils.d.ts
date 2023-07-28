import { SpectralReport } from "./interfaces";
export declare const COMPLETENESS_ISSUES: string[];
export declare const getCompletenessRating: (issues: SpectralReport) => {
    completenessScore: number;
    completenessIssues: import("@stoplight/spectral-core").ISpectralDiagnostic[];
};
export declare const getCompletenessIssues: (issues: SpectralReport) => import("@stoplight/spectral-core").ISpectralDiagnostic[];
export declare const getLengthNormalizedCompletenessRating: (issues: SpectralReport, length: number) => {
    completenessScore: number;
    completenessIssues: import("@stoplight/spectral-core").ISpectralDiagnostic[];
};
//# sourceMappingURL=completeness-rating-utils.d.ts.map