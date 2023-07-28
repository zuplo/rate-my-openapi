import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { RatingOutput, SpectralReport } from "./interfaces";
export declare const generateOpenApiRating: (outputReport: SpectralReport, openApi: OpenAPIV3_1.Document | OpenAPIV3.Document) => RatingOutput;
export declare const getScoreDelta: (severity: 0 | 1 | 2 | 3) => 50 | 25 | 10 | 5;
//# sourceMappingURL=rating-utils.d.ts.map