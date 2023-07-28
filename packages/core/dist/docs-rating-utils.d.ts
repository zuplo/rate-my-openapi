import { SpectralReport } from "./interfaces";
export declare const DOCS_ISSUES: string[];
export declare const getDocsRating: (issues: SpectralReport) => {
    docsScore: number;
    docsIssues: import("@stoplight/spectral-core").ISpectralDiagnostic[];
};
export declare const getDocsIssues: (issues: SpectralReport) => import("@stoplight/spectral-core").ISpectralDiagnostic[];
export declare const getLengthNormalizedDocsRating: (issues: SpectralReport, length: number) => {
    docsScore: number;
    docsIssues: import("@stoplight/spectral-core").ISpectralDiagnostic[];
};
//# sourceMappingURL=docs-rating-utils.d.ts.map