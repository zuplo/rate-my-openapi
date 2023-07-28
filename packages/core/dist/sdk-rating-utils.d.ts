import { SpectralReport } from "./interfaces";
export declare const SDK_ISSUES: string[];
export declare const getSdkGenerationRating: (issues: SpectralReport) => {
    sdkGenerationScore: number;
    sdkGenerationIssues: import("@stoplight/spectral-core").ISpectralDiagnostic[];
};
export declare const getSdkGenerationIssues: (issues: SpectralReport) => import("@stoplight/spectral-core").ISpectralDiagnostic[];
export declare const getLengthNormalizedSdkGenerationRating: (issues: SpectralReport, length: number) => {
    sdkGenerationScore: number;
    sdkGenerationIssues: import("@stoplight/spectral-core").ISpectralDiagnostic[];
};
//# sourceMappingURL=sdk-rating-utils.d.ts.map