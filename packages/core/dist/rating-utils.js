"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScoreDelta = exports.generateOpenApiRating = void 0;
const completeness_rating_utils_1 = require("./completeness-rating-utils");
const docs_rating_utils_1 = require("./docs-rating-utils");
const sdk_rating_utils_1 = require("./sdk-rating-utils");
const security_rating_utils_1 = require("./security-rating-utils");
// NOTE: Should sum to 1
const OPEN_API_PROPERTY_WEIGHTS = {
    info: 0.1,
    servers: 0.05,
    tags: 0.05,
    security: 0.05,
    paths: 0.6,
    components: 0.15,
};
const generateOpenApiRating = (outputReport, openApi) => {
    const issuesByArea = outputReport.reduce((issuesByArea, issue) => {
        let area = issue.path[0];
        if (!area) {
            // This can happen for issues with areas being present in the top level
            const inferredArea = inferAreaFromIssue(issue);
            if (!inferredArea) {
                console.log("Could not infer area from issue - skipping: ", issue);
                return issuesByArea;
            }
            area = inferredArea;
            issue.path = [area];
        }
        if (!issuesByArea[area]) {
            // TODO: Not sure when this would happen, should collect some telemetry
            // on this to see if it's a problem
            const inferredArea = inferAreaFromIssue(issue);
            if (!inferredArea) {
                console.log("Could not infer area from issue - skipping: ", issue);
                return issuesByArea;
            }
            area = inferredArea;
            issue.path = [area];
        }
        issuesByArea[area].push(issue);
        return issuesByArea;
    }, {
        components: [],
        paths: [],
        security: [],
        tags: [],
        info: [],
        servers: [],
    });
    const pathRatings = getPathRatings(openApi, issuesByArea.paths);
    let totalPathsScore = 0;
    let totalPathsDocsScore = 0;
    let totalCompletenessScore = 0;
    let totalSdkGenerationScore = 0;
    let totalSecurityScore = 0;
    Object.values(pathRatings).forEach((pathRating) => {
        totalPathsScore = totalPathsScore + pathRating.score;
        totalPathsDocsScore = totalPathsDocsScore + pathRating.docsScore;
        totalCompletenessScore =
            totalCompletenessScore + pathRating.completenessScore;
        totalSdkGenerationScore =
            totalSdkGenerationScore + pathRating.sdkGenerationScore;
        totalSecurityScore = totalSecurityScore + pathRating.securityScore;
    });
    const pathsScore = Math.round(totalPathsScore / Object.keys(pathRatings).length);
    const pathsDocsScore = Math.round(totalPathsDocsScore / Object.keys(pathRatings).length);
    const pathsCompletenessScore = Math.round(totalCompletenessScore / Object.keys(pathRatings).length);
    const pathsSdkGenerationScore = Math.round(totalSdkGenerationScore / Object.keys(pathRatings).length);
    const pathsSecurityScore = Math.round(totalSecurityScore / Object.keys(pathRatings).length);
    const pathsRating = {
        score: pathsScore,
        issues: issuesByArea.paths,
        docsScore: pathsDocsScore,
        docsIssues: (0, docs_rating_utils_1.getDocsIssues)(issuesByArea.paths),
        completenessScore: pathsCompletenessScore,
        completenessIssues: (0, completeness_rating_utils_1.getCompletenessIssues)(issuesByArea.paths),
        sdkGenerationScore: pathsSdkGenerationScore,
        sdkGenerationIssues: (0, sdk_rating_utils_1.getSdkGenerationIssues)(issuesByArea.paths),
        securityScore: pathsSecurityScore,
        securityIssues: (0, security_rating_utils_1.getSecurityIssues)(issuesByArea.paths),
        ...pathRatings,
    };
    // TODO: Incorporate components rating
    const componentsRating = getComponentsRatings(openApi, issuesByArea.components);
    const infoObjectRating = getAreaRating(issuesByArea.info);
    const tagsRating = openApi.tags?.length
        ? getLengthNormalizedAreaRating(issuesByArea.tags, openApi.tags?.length)
        : // Having tags is not mandatory, so we count this as a single warning
            // TODO: Should we penalize harder for having more paths?
            {
                score: 85,
                issues: issuesByArea.tags,
                docsScore: 85,
                docsIssues: (0, docs_rating_utils_1.getDocsIssues)(issuesByArea.tags),
                completenessScore: 0,
                completenessIssues: (0, completeness_rating_utils_1.getCompletenessIssues)(issuesByArea.tags),
                sdkGenerationScore: 100,
                sdkGenerationIssues: (0, sdk_rating_utils_1.getSdkGenerationIssues)(issuesByArea.tags),
                securityScore: 100,
                securityIssues: (0, security_rating_utils_1.getSecurityIssues)(issuesByArea.tags),
            };
    const serversRating = openApi.servers?.length
        ? getLengthNormalizedAreaRating(issuesByArea.servers, openApi.servers.length)
        : // You should always define servers
            {
                score: 0,
                issues: issuesByArea.servers,
                docsScore: 0,
                docsIssues: (0, docs_rating_utils_1.getDocsIssues)(issuesByArea.servers),
                completenessScore: 0,
                completenessIssues: (0, completeness_rating_utils_1.getCompletenessIssues)(issuesByArea.servers),
                sdkGenerationScore: 0,
                sdkGenerationIssues: (0, sdk_rating_utils_1.getSdkGenerationIssues)(issuesByArea.servers),
                securityScore: 0,
                securityIssues: (0, security_rating_utils_1.getSecurityIssues)(issuesByArea.servers),
            };
    const securityRating = openApi.security?.length
        ? getLengthNormalizedAreaRating(issuesByArea.security, openApi.security.length)
        : // Security is not a mandatory property, but chances are the API is
            // secured in some way, but they just didn't document it, so we count this
            // as a single warning. Security can also be documented at the operation
            // level.
            {
                score: 85,
                issues: issuesByArea.security,
                docsScore: 85,
                docsIssues: (0, docs_rating_utils_1.getDocsIssues)(issuesByArea.security),
                completenessScore: 85,
                completenessIssues: (0, completeness_rating_utils_1.getCompletenessIssues)(issuesByArea.security),
                sdkGenerationScore: 85,
                sdkGenerationIssues: (0, sdk_rating_utils_1.getSdkGenerationIssues)(issuesByArea.security),
                securityScore: 85,
                securityIssues: (0, security_rating_utils_1.getSecurityIssues)(issuesByArea.security),
            };
    return {
        issues: outputReport,
        docsIssues: (0, docs_rating_utils_1.getDocsIssues)(outputReport),
        completenessIssues: (0, completeness_rating_utils_1.getCompletenessIssues)(outputReport),
        sdkGenerationIssues: (0, sdk_rating_utils_1.getSdkGenerationIssues)(outputReport),
        securityIssues: (0, security_rating_utils_1.getSecurityIssues)(outputReport),
        paths: pathsRating,
        info: infoObjectRating,
        servers: serversRating,
        tags: tagsRating,
        security: securityRating,
        components: componentsRating,
        score: Math.round(pathsScore * OPEN_API_PROPERTY_WEIGHTS.paths +
            tagsRating.score * OPEN_API_PROPERTY_WEIGHTS.tags +
            serversRating.score * OPEN_API_PROPERTY_WEIGHTS.servers +
            securityRating.score * OPEN_API_PROPERTY_WEIGHTS.security +
            infoObjectRating.score * OPEN_API_PROPERTY_WEIGHTS.info +
            componentsRating.score * OPEN_API_PROPERTY_WEIGHTS.components),
        docsScore: Math.round(pathsDocsScore * OPEN_API_PROPERTY_WEIGHTS.paths +
            tagsRating.docsScore * OPEN_API_PROPERTY_WEIGHTS.tags +
            serversRating.docsScore * OPEN_API_PROPERTY_WEIGHTS.servers +
            securityRating.docsScore * OPEN_API_PROPERTY_WEIGHTS.security +
            infoObjectRating.docsScore * OPEN_API_PROPERTY_WEIGHTS.info +
            componentsRating.docsScore * OPEN_API_PROPERTY_WEIGHTS.components),
        completenessScore: Math.round(pathsCompletenessScore * OPEN_API_PROPERTY_WEIGHTS.paths +
            tagsRating.completenessScore * OPEN_API_PROPERTY_WEIGHTS.tags +
            serversRating.completenessScore * OPEN_API_PROPERTY_WEIGHTS.servers +
            securityRating.completenessScore * OPEN_API_PROPERTY_WEIGHTS.security +
            infoObjectRating.completenessScore * OPEN_API_PROPERTY_WEIGHTS.info +
            componentsRating.completenessScore *
                OPEN_API_PROPERTY_WEIGHTS.components),
        sdkGenerationScore: Math.round(pathsSdkGenerationScore * OPEN_API_PROPERTY_WEIGHTS.paths +
            tagsRating.sdkGenerationScore * OPEN_API_PROPERTY_WEIGHTS.tags +
            serversRating.sdkGenerationScore * OPEN_API_PROPERTY_WEIGHTS.servers +
            securityRating.sdkGenerationScore * OPEN_API_PROPERTY_WEIGHTS.security +
            infoObjectRating.sdkGenerationScore * OPEN_API_PROPERTY_WEIGHTS.info +
            componentsRating.sdkGenerationScore *
                OPEN_API_PROPERTY_WEIGHTS.components),
        securityScore: Math.round(pathsSecurityScore * OPEN_API_PROPERTY_WEIGHTS.paths +
            tagsRating.securityScore * OPEN_API_PROPERTY_WEIGHTS.tags +
            serversRating.securityScore * OPEN_API_PROPERTY_WEIGHTS.servers +
            securityRating.securityScore * OPEN_API_PROPERTY_WEIGHTS.security +
            infoObjectRating.securityScore * OPEN_API_PROPERTY_WEIGHTS.info +
            componentsRating.securityScore * OPEN_API_PROPERTY_WEIGHTS.components),
    };
};
exports.generateOpenApiRating = generateOpenApiRating;
/**
 * @description Calculated the ratings for each path and operation in the API.
 * The scores are normalized by the size of the API so large OpenAPIs don't get
 * penalized for having the same issue multiple times.
 */
const getPathRatings = (openApi, pathsIssues) => {
    const operations = [
        "get",
        "put",
        "post",
        "delete",
        "options",
        "head",
        "patch",
        "trace",
    ];
    // Grab the path/operation issues first as they are the bulk of the API
    const issuesByPathAndOperation = pathsIssues.reduce((issuesByPathAndOperation, pathIssue) => {
        const path = pathIssue.path[1];
        if (!issuesByPathAndOperation[path]) {
            issuesByPathAndOperation[path] = {
                get: [],
                put: [],
                post: [],
                delete: [],
                options: [],
                head: [],
                patch: [],
                trace: [],
                other: [],
            };
        }
        const operation = pathIssue.path[2] &&
            operations.includes(pathIssue.path[2])
            ? pathIssue.path[2]
            : "other";
        issuesByPathAndOperation[path][operation].push(pathIssue);
        return issuesByPathAndOperation;
    }, {});
    const { paths } = openApi;
    if (!paths) {
        throw new Error("No paths found in OpenAPI file");
    }
    // We iterate through the paths to calculate a score for each one and then
    // average them to get the overall score for the API's paths
    return Object.entries(paths).reduce((pathRatings, [path, pathItem]) => {
        if (!pathItem) {
            // This should never happen
            throw new Error(`Path ${path} maps to an undefined pathItem`);
        }
        if (!issuesByPathAndOperation[path]) {
            // No issues? Perfect score!
            pathRatings[path] = {
                score: 100,
                issues: [],
                docsScore: 100,
                docsIssues: [],
                completenessScore: 100,
                completenessIssues: [],
                sdkGenerationScore: 100,
                sdkGenerationIssues: [],
                securityScore: 100,
                securityIssues: [],
            };
            return pathRatings;
        }
        let pathRating = {
            score: 100,
            issues: issuesByPathAndOperation[path]["other"],
            docsScore: 100,
            docsIssues: (0, docs_rating_utils_1.getDocsIssues)(issuesByPathAndOperation[path]["other"]),
            completenessScore: 100,
            completenessIssues: (0, completeness_rating_utils_1.getCompletenessIssues)(issuesByPathAndOperation[path]["other"]),
            sdkGenerationScore: 100,
            sdkGenerationIssues: (0, sdk_rating_utils_1.getSdkGenerationIssues)(issuesByPathAndOperation[path]["other"]),
            securityScore: 100,
            securityIssues: (0, security_rating_utils_1.getSecurityIssues)(issuesByPathAndOperation[path]["other"]),
        };
        // We calculate the path score by averaging the scores of the operations
        operations.forEach((operation) => {
            const operationItem = pathItem[operation];
            if (!operationItem) {
                return;
            }
            const operationIssues = issuesByPathAndOperation[path][operation];
            if (!operationIssues) {
                // No issues? Perfect score!
                pathRating[operation] = {
                    score: 100,
                    issues: [],
                    docsScore: 100,
                    docsIssues: [],
                    completenessScore: 100,
                    completenessIssues: [],
                    sdkGenerationScore: 100,
                    sdkGenerationIssues: [],
                    securityScore: 100,
                    securityIssues: [],
                };
                return;
            }
            const operationScore = getNormalizedOperationRating(operationItem, operationIssues);
            const docsIssues = (0, docs_rating_utils_1.getDocsIssues)(operationIssues);
            const docsScore = getNormalizedOperationRating(operationItem, docsIssues);
            const completenessIssues = (0, completeness_rating_utils_1.getCompletenessIssues)(operationIssues);
            const completenessScore = getNormalizedOperationRating(operationItem, completenessIssues);
            const sdkGenerationIssues = (0, sdk_rating_utils_1.getSdkGenerationIssues)(operationIssues);
            const sdkGenerationScore = getNormalizedOperationRating(operationItem, sdkGenerationIssues);
            const securityIssues = (0, security_rating_utils_1.getSecurityIssues)(operationIssues);
            const securityScore = getNormalizedOperationRating(operationItem, securityIssues);
            pathRating[operation] = {
                score: operationScore,
                issues: operationIssues,
                docsScore,
                docsIssues,
                completenessScore,
                completenessIssues,
                sdkGenerationScore,
                sdkGenerationIssues,
                securityScore,
                securityIssues,
            };
            // Collect all the operation's issues into the path's issues
            pathRating.issues = pathRating.issues.concat(operationIssues);
            pathRating.docsIssues = pathRating.docsIssues.concat(docsIssues);
            pathRating.completenessIssues =
                pathRating.completenessIssues.concat(completenessIssues);
            pathRating.sdkGenerationIssues =
                pathRating.sdkGenerationIssues.concat(sdkGenerationIssues);
            pathRating.securityIssues =
                pathRating.securityIssues.concat(securityIssues);
        });
        // Remove score and issues keys
        const numOperations = Object.keys(pathRating).filter((key) => operations.includes(key)).length;
        if (numOperations) {
            let totalScore = 0;
            let totalDocsScore = 0;
            let totalCompletenessScore = 0;
            let totalSdkGenerationScore = 0;
            let totalSecurityScore = 0;
            Object.entries(pathRating).forEach(([key, maybeOperationRating]) => {
                if (!operations.includes(key)) {
                    // Non-operation key (ex. issues, score, etc.)
                    return;
                }
                const operationRating = maybeOperationRating;
                totalScore = totalScore + operationRating.score;
                totalDocsScore = totalDocsScore + operationRating.docsScore;
                totalCompletenessScore =
                    totalCompletenessScore + operationRating.completenessScore;
                totalSdkGenerationScore =
                    totalSdkGenerationScore + operationRating.sdkGenerationScore;
                totalSecurityScore = totalSecurityScore + operationRating.securityScore;
            });
            // We must also account for issues on the path itself
            const pathIssues = issuesByPathAndOperation[path]["other"];
            pathRating.score = Math.round(totalScore / numOperations - getPathIssueDelta(pathIssues));
            pathRating.docsScore = Math.round(totalDocsScore / numOperations -
                getPathIssueDelta((0, docs_rating_utils_1.getDocsIssues)(pathIssues)));
            pathRating.completenessScore = Math.round(totalCompletenessScore / numOperations -
                getPathIssueDelta((0, completeness_rating_utils_1.getCompletenessIssues)(pathIssues)));
            pathRating.sdkGenerationScore = Math.round(totalSdkGenerationScore / numOperations -
                getPathIssueDelta((0, sdk_rating_utils_1.getSdkGenerationIssues)(pathIssues)));
            pathRating.securityScore = Math.round(totalSecurityScore / numOperations -
                getPathIssueDelta((0, security_rating_utils_1.getSecurityIssues)(pathIssues)));
        }
        else {
            pathRating.score = 0; // Wtf, why document a path with no operations - FAIL
            pathRating.docsScore = 0;
            pathRating.completenessScore = 0;
            pathRating.sdkGenerationScore = 0;
            pathRating.securityScore = 0;
        }
        pathRatings[path] = pathRating;
        return pathRatings;
    }, {});
};
/**
 * @description Generates a rating for an Operation, normalizing the score based
 * on how many properties exist on the operation and how many issues were found
 * on those properties. Ex. Having 3 response-related issues amongst 5 responses
 * should be treated the same as having 6 response-related issues amongst 10.
 */
const getNormalizedOperationRating = (operationItem, operationIssues) => {
    // We calculate the operation score by averaging the scores of the
    // key properties of the operation
    // Start with the count of properties we consider required:
    // Description, tags, operationId, and responses
    let averagingDenominator = 4;
    // You should have a description so not having one gets penalized
    let descriptionScore = operationItem.description ? 100 : 0;
    // You should always document responses
    let responsesScore = operationItem.responses ? 100 : 0;
    // You should use tags
    let tagsScore = operationItem.tags ? 100 : 0;
    // You should use an operationId
    let operationIdScore = operationItem.operationId ? 100 : 0;
    // GET and HEAD won't have a requestBody, and some POSTs might not
    // either
    let requestBodyScore = operationItem.requestBody ? 100 : undefined;
    if (requestBodyScore) {
        averagingDenominator++;
    }
    // You can have a parameter-less operation too
    let parametersScore = operationItem.parameters ? 100 : undefined;
    if (parametersScore) {
        averagingDenominator++;
    }
    operationIssues.forEach((issue) => {
        const scoreDelta = (0, exports.getScoreDelta)(issue.severity);
        const property = issue.path[3];
        if (!property) {
            if (typeof issue.code === "string" &&
                issue.code.includes("description")) {
                descriptionScore = Math.max(0, descriptionScore - scoreDelta);
            }
            return;
        }
        if (property?.startsWith("parameters") &&
            parametersScore &&
            operationItem.parameters) {
            parametersScore = Math.max(0, 
            // Normalize the scoreDelta by the number of parameters
            // Ex. making a mistake on only 1 of 5 parameters should not
            // affect the score as much as making a mistake on all of them
            parametersScore - scoreDelta / operationItem.parameters.length);
            return;
        }
        if (property === "requestBody" && requestBodyScore) {
            requestBodyScore = Math.max(0, requestBodyScore - scoreDelta);
            return;
        }
        if (property === "responses" && operationItem.responses) {
            const responseCode = issue.path[4];
            if (responseCode) {
                responsesScore = Math.max(0, 
                // If the issue is on a specific response, normalize the scoreDelta
                responsesScore -
                    scoreDelta / Object.keys(operationItem.responses).length);
                return;
            }
            responsesScore = Math.max(0, responsesScore - scoreDelta);
            return;
        }
        if (property?.startsWith("tags") && operationItem.tags) {
            tagsScore = Math.max(0, tagsScore - scoreDelta / (operationItem.tags?.length ?? 1));
            return;
        }
        if (property?.startsWith("operationId")) {
            operationIdScore = Math.max(0, operationIdScore - scoreDelta);
            return;
        }
    });
    return Math.round((descriptionScore +
        responsesScore +
        (requestBodyScore ?? 0) +
        (parametersScore ?? 0) +
        tagsScore +
        operationIdScore) /
        averagingDenominator);
};
const getComponentsRatings = (openApi, componentsIssues) => {
    const { components } = openApi;
    if (!components) {
        // No components, no problems
        return {
            score: 100,
            issues: componentsIssues,
            docsScore: 100,
            docsIssues: (0, docs_rating_utils_1.getDocsIssues)(componentsIssues),
            completenessScore: 100,
            completenessIssues: (0, completeness_rating_utils_1.getCompletenessIssues)(componentsIssues),
            sdkGenerationScore: 0,
            sdkGenerationIssues: (0, sdk_rating_utils_1.getSdkGenerationIssues)(componentsIssues),
            securityScore: 100,
            securityIssues: (0, security_rating_utils_1.getSecurityIssues)(componentsIssues),
        };
    }
    const componentCategoryKeys = [
        "schemas",
        "responses",
        "parameters",
        "examples",
        "requestBodies",
        "headers",
        "securitySchemes",
        "links",
        "callbacks",
        // We use V3 here because V3_1 added pathItems which no-one uses anyways
    ];
    const issuesByComponent = componentsIssues.reduce((issuesByComponent, componentIssue) => {
        const componentKey = componentIssue
            .path[1];
        if (!issuesByComponent[componentKey]) {
            issuesByComponent[componentKey] = {};
        }
        // Will never be a number in practice, so we can safely cast to string
        const componentName = componentIssue.path.at(2);
        if (!componentName) {
            console.warn("Found component issue with no component name. Skipping.", componentIssue);
            return issuesByComponent;
        }
        if (!issuesByComponent[componentKey][componentName]) {
            issuesByComponent[componentKey][componentName] = [];
        }
        issuesByComponent[componentKey][componentName].push(componentIssue);
        return issuesByComponent;
    }, {});
    // We iterate through the components to calculate a score for each one and
    // then average them to get the overall score for the API's components
    const componentCategoryRatings = componentCategoryKeys.reduce((componentCategoryRatings, componentKey) => {
        // Category being the top level categorization (ex. schemas, requestBody)
        const componentCategory = components[componentKey];
        if (!componentCategory) {
            return componentCategoryRatings;
        }
        const componentCategoryIssues = issuesByComponent[componentKey];
        if (!componentCategoryIssues) {
            // No issues? Perfect score!
            componentCategoryRatings[componentKey] = {
                score: 100,
                issues: [],
                docsScore: 100,
                docsIssues: [],
                completenessScore: 100,
                completenessIssues: [],
                sdkGenerationScore: 100,
                sdkGenerationIssues: [],
                securityScore: 100,
                securityIssues: [],
            };
            return componentCategoryRatings;
        }
        let componentCategoryRating = {
            score: 100,
            issues: [],
            docsScore: 100,
            docsIssues: [],
            completenessScore: 100,
            completenessIssues: [],
            sdkGenerationScore: 100,
            sdkGenerationIssues: [],
            securityScore: 100,
            securityIssues: [],
        };
        const componentRatings = Object.keys(componentCategory).reduce((componentsRatings, componentName) => {
            const componentIssues = componentCategoryIssues[componentName];
            if (!componentIssues) {
                // No issues? Perfect score!
                componentsRatings[componentName] = {
                    score: 100,
                    issues: [],
                    docsScore: 100,
                    docsIssues: [],
                    completenessScore: 100,
                    completenessIssues: [],
                    sdkGenerationScore: 100,
                    sdkGenerationIssues: [],
                    securityScore: 100,
                    securityIssues: [],
                };
                return componentsRatings;
            }
            let componentScore = 100;
            componentIssues.forEach((issue) => {
                const delta = (0, exports.getScoreDelta)(issue.severity);
                componentScore = Math.max(0, componentScore - delta);
            });
            const { docsScore, docsIssues } = (0, docs_rating_utils_1.getDocsRating)(componentIssues);
            const { completenessScore, completenessIssues } = (0, completeness_rating_utils_1.getCompletenessRating)(componentIssues);
            const { sdkGenerationScore, sdkGenerationIssues } = (0, sdk_rating_utils_1.getSdkGenerationRating)(componentIssues);
            const { securityScore, securityIssues } = (0, security_rating_utils_1.getSecurityRating)(componentIssues);
            componentsRatings[componentName] = {
                score: componentScore,
                issues: componentIssues,
                docsScore,
                docsIssues,
                completenessScore,
                completenessIssues,
                sdkGenerationScore,
                sdkGenerationIssues,
                securityScore,
                securityIssues,
            };
            componentCategoryRating.issues =
                componentCategoryRating.issues.concat(componentIssues);
            componentCategoryRating.docsIssues =
                componentCategoryRating.docsIssues.concat(docsIssues);
            componentCategoryRating.completenessIssues =
                componentCategoryRating.completenessIssues.concat(completenessIssues);
            componentCategoryRating.sdkGenerationIssues =
                componentCategoryRating.sdkGenerationIssues.concat(sdkGenerationIssues);
            componentCategoryRating.securityIssues =
                componentCategoryRating.securityIssues.concat(securityIssues);
            return componentsRatings;
        }, {});
        let totalComponentsScore = 0;
        let totalComponentsDocsScore = 0;
        let totalCompletenessScore = 0;
        let totalSdkGenerationScore = 0;
        let totalSecurityScore = 0;
        Object.values(componentRatings).forEach((componentRating) => {
            totalComponentsScore = totalComponentsScore + componentRating.score;
            totalComponentsDocsScore =
                totalComponentsDocsScore + componentRating.docsScore;
            totalCompletenessScore =
                totalCompletenessScore + componentRating.completenessScore;
            totalSdkGenerationScore =
                totalSdkGenerationScore + componentRating.sdkGenerationScore;
            totalSecurityScore = totalSecurityScore + componentRating.securityScore;
        });
        const componentCategoryScore = Math.round(totalComponentsScore / Object.keys(componentRatings).length);
        const componentCategoryDocsScore = Math.round(totalComponentsDocsScore / Object.keys(componentRatings).length);
        const componentCategoryCompletenessScore = Math.round(totalCompletenessScore / Object.keys(componentRatings).length);
        const componentCategorySdkGenerationScore = Math.round(totalSdkGenerationScore / Object.keys(componentRatings).length);
        const componentCategorySecurityScore = Math.round(totalSecurityScore / Object.keys(componentRatings).length);
        componentCategoryRatings[componentKey] = {
            score: componentCategoryScore,
            issues: componentCategoryRating.issues,
            docsScore: componentCategoryDocsScore,
            docsIssues: componentCategoryRating.docsIssues,
            completenessScore: componentCategoryCompletenessScore,
            completenessIssues: componentCategoryRating.completenessIssues,
            sdkGenerationScore: componentCategorySdkGenerationScore,
            sdkGenerationIssues: componentCategoryRating.sdkGenerationIssues,
            securityScore: componentCategorySecurityScore,
            securityIssues: componentCategoryRating.securityIssues,
            ...componentRatings,
        };
        return componentCategoryRatings;
    }, {});
    let totalComponentCategoryScore = 0;
    let totalComponentsCategoryDocsScore = 0;
    let totalComponentsCategoryCompletenessScore = 0;
    let totalComponentsCategorySdkGenerationScore = 0;
    let totalComponentsCategorySecurityScore = 0;
    Object.values(componentCategoryRatings).forEach((rating) => {
        totalComponentCategoryScore = totalComponentCategoryScore + rating.score;
        totalComponentsCategoryDocsScore =
            totalComponentsCategoryDocsScore + rating.docsScore;
        totalComponentsCategoryCompletenessScore =
            totalComponentsCategoryCompletenessScore + rating.completenessScore;
        totalComponentsCategorySdkGenerationScore =
            totalComponentsCategorySdkGenerationScore + rating.sdkGenerationScore;
        totalComponentsCategorySecurityScore =
            totalComponentsCategorySecurityScore + rating.securityScore;
    });
    const componentsScore = Math.round(totalComponentCategoryScore / Object.keys(componentCategoryRatings).length);
    const componentsDocsScore = Math.round(totalComponentsCategoryDocsScore /
        Object.keys(componentCategoryRatings).length);
    const componentsCompletenessScore = Math.round(totalComponentsCategoryCompletenessScore /
        Object.keys(componentCategoryRatings).length);
    const componentsSdkGenerationScore = Math.round(totalComponentsCategorySdkGenerationScore /
        Object.keys(componentCategoryRatings).length);
    const componentsSecurityScore = Math.round(totalComponentsCategorySecurityScore /
        Object.keys(componentCategoryRatings).length);
    return {
        score: componentsScore,
        issues: componentsIssues,
        docsScore: componentsDocsScore,
        docsIssues: (0, docs_rating_utils_1.getDocsIssues)(componentsIssues),
        completenessScore: componentsCompletenessScore,
        completenessIssues: (0, completeness_rating_utils_1.getCompletenessIssues)(componentsIssues),
        sdkGenerationScore: componentsSdkGenerationScore,
        sdkGenerationIssues: (0, sdk_rating_utils_1.getSdkGenerationIssues)(componentsIssues),
        securityScore: componentsSecurityScore,
        securityIssues: (0, security_rating_utils_1.getSecurityIssues)(componentsIssues),
        ...componentCategoryRatings,
    };
};
const getAreaRating = (areaIssues) => {
    return getLengthNormalizedAreaRating(areaIssues, 1);
};
const getLengthNormalizedAreaRating = (areaIssues, areaLength) => {
    const totalDelta = areaIssues.reduce((totalPenalty, issue) => {
        const delta = (0, exports.getScoreDelta)(issue.severity);
        return totalPenalty + delta;
    }, 0);
    const { docsScore, docsIssues } = (0, docs_rating_utils_1.getLengthNormalizedDocsRating)(areaIssues, areaLength);
    const { completenessScore, completenessIssues } = (0, completeness_rating_utils_1.getLengthNormalizedCompletenessRating)(areaIssues, areaLength);
    const { sdkGenerationScore, sdkGenerationIssues } = (0, sdk_rating_utils_1.getLengthNormalizedSdkGenerationRating)(areaIssues, areaLength);
    const { securityScore, securityIssues } = (0, security_rating_utils_1.getLengthNormalizedSecurityRating)(areaIssues, areaLength);
    return {
        score: Math.max(0, 100 - totalDelta / areaLength),
        issues: areaIssues,
        docsScore,
        docsIssues,
        completenessScore,
        completenessIssues,
        sdkGenerationScore,
        sdkGenerationIssues,
        securityScore,
        securityIssues,
    };
};
// How heavily should each issue impact the score?
// Nothing is scientific here - I made these up
const getScoreDelta = (severity) => {
    switch (severity) {
        case 0:
            return 50; // Essentially an error so judged harshly
        case 1:
            return 25; // Warning, likely affects end-user experience
        case 2:
            return 10; // Info, may not affect end-user
        case 3:
            return 5; // Hint, prescriptive suggestions essentially
    }
};
exports.getScoreDelta = getScoreDelta;
// Issues discovered at the paths level, that affect all operations
const getPathIssueDelta = (pathIssues) => {
    return pathIssues.reduce((pathIssueDeltaSum, pathIssue) => {
        return pathIssueDeltaSum + (0, exports.getScoreDelta)(pathIssue.severity);
    }, 0);
};
const inferAreaFromIssue = (issue) => {
    if (issue.path.length > 0) {
        const areaHint = issue.path[0];
        if (areaHint.toString().includes("info")) {
            return "info";
        }
        else if (areaHint.toString().includes("server")) {
            return "servers";
        }
        else if (areaHint.toString().includes("path")) {
            return "paths";
        }
        else if (areaHint.toString().includes("component")) {
            return "components";
        }
        else if (areaHint.toString().includes("security")) {
            return "security";
        }
        else if (areaHint.toString().includes("tag")) {
            return "tags";
        }
    }
    if (typeof issue.code !== "string") {
        return undefined;
    }
    // The path can be empty for top-level issues
    if (issue.code.includes("info")) {
        return "info";
    }
    else if (issue.code.includes("server")) {
        return "servers";
    }
    else if (issue.code.includes("path")) {
        return "paths";
    }
    else if (issue.code.includes("component")) {
        return "components";
    }
    else if (issue.code.includes("security")) {
        return "security";
    }
    else if (issue.code.includes("tag")) {
        return "tags";
    }
    return undefined;
};
//# sourceMappingURL=rating-utils.js.map