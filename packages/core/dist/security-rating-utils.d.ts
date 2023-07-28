import { SpectralReport } from "./interfaces";
export declare const SECURITY_ISSUES: string[];
export declare const getSecurityRating: (issues: SpectralReport) => {
    securityScore: number;
    securityIssues: import("@stoplight/spectral-core").ISpectralDiagnostic[];
};
export declare const getSecurityIssues: (issues: SpectralReport) => import("@stoplight/spectral-core").ISpectralDiagnostic[];
export declare const getLengthNormalizedSecurityRating: (issues: SpectralReport, length: number) => {
    securityScore: number;
    securityIssues: import("@stoplight/spectral-core").ISpectralDiagnostic[];
};
//# sourceMappingURL=security-rating-utils.d.ts.map