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
    [key: string]: Rating | number | SpectralReport;
}
export interface RatingOutput extends Rating {
    paths: PathsRating;
    info: Rating;
    security: Rating;
    tags: Rating;
    servers: Rating;
    components: ComponentsRating;
}
//# sourceMappingURL=interfaces.d.ts.map