import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import {
  getCompletenessIssues,
  getCompletenessRating,
  getLengthNormalizedCompletenessRating,
} from "./completeness-rating-utils";
import {
  getDocsIssues,
  getDocsRating,
  getLengthNormalizedDocsRating,
} from "./docs-rating-utils";
import {
  ComponentRating,
  ComponentsRating,
  PathRating,
  PathsRating,
  Rating,
  RatingOutput,
  SpectralReport,
} from "./interfaces";
import {
  getLengthNormalizedSdkGenerationRating,
  getSdkGenerationIssues,
  getSdkGenerationRating,
} from "./sdk-rating-utils";
import {
  getLengthNormalizedSecurityRating,
  getSecurityIssues,
  getSecurityRating,
} from "./security-rating-utils";

// NOTE: Should sum to 1
const OPEN_API_PROPERTY_WEIGHTS = {
  info: 0.1,
  servers: 0.05,
  tags: 0.05,
  security: 0.05,
  paths: 0.6,
  components: 0.15,
};

export function generateOpenApiRating(
  outputReport: SpectralReport,
  openApi: OpenAPIV3_1.Document | OpenAPIV3.Document,
): RatingOutput {
  const processingErrors: string[] = [];
  const issuesByArea = outputReport.reduce(
    (issuesByArea, issue) => {
      let area = issue.path[0] as keyof typeof issuesByArea | undefined;
      if (!area) {
        // This can happen for issues with areas being present in the top level
        const inferredArea = inferAreaFromIssue(issue) as
          | keyof typeof issuesByArea
          | undefined;
        if (!inferredArea) {
          processingErrors.push(
            `Could not infer area from issue - skipping: ${JSON.stringify(
              issue,
            )}`,
          );
          return issuesByArea;
        }
        area = inferredArea;
        issue.path = [area];
      }
      if (!issuesByArea[area]) {
        // TODO: Not sure when this would happen, should collect some telemetry
        // on this to see if it's a problem
        const inferredArea = inferAreaFromIssue(issue) as
          | keyof typeof issuesByArea
          | undefined;
        if (!inferredArea) {
          processingErrors.push(
            `Could not infer area from issue - skipping: ${JSON.stringify(
              issue,
            )}`,
          );
          return issuesByArea;
        }
        area = inferredArea;
        issue.path = [area];
      }
      issuesByArea[area].push(issue);
      return issuesByArea;
    },
    {
      components: [],
      paths: [],
      security: [],
      tags: [],
      info: [],
      servers: [],
    } as {
      components: SpectralReport;
      paths: SpectralReport;
      security: SpectralReport;
      tags: SpectralReport;
      info: SpectralReport;
      servers: SpectralReport;
    },
  );

  const pathRatings = getPathRatings(openApi, issuesByArea.paths);
  let totalPathsDocsScore = 0;
  let totalCompletenessScore = 0;
  let totalSdkGenerationScore = 0;
  let totalSecurityScore = 0;
  Object.values(pathRatings).forEach((pathRating) => {
    totalPathsDocsScore = totalPathsDocsScore + pathRating.docsScore;
    totalCompletenessScore =
      totalCompletenessScore + pathRating.completenessScore;
    totalSdkGenerationScore =
      totalSdkGenerationScore + pathRating.sdkGenerationScore;
    totalSecurityScore = totalSecurityScore + pathRating.securityScore;
  });
  const pathsDocsScore = Math.round(
    totalPathsDocsScore / Object.keys(pathRatings).length,
  );
  const pathsCompletenessScore = Math.round(
    totalCompletenessScore / Object.keys(pathRatings).length,
  );
  const pathsSdkGenerationScore = Math.round(
    totalSdkGenerationScore / Object.keys(pathRatings).length,
  );
  const pathsSecurityScore = Math.round(
    totalSecurityScore / Object.keys(pathRatings).length,
  );
  const pathsScore = Math.round(
    (pathsDocsScore +
      pathsCompletenessScore +
      pathsSdkGenerationScore +
      pathsSecurityScore) /
      4,
  );
  const pathsRating: PathsRating = {
    score: pathsScore,
    issues: issuesByArea.paths,
    docsScore: pathsDocsScore,
    docsIssues: getDocsIssues(issuesByArea.paths),
    completenessScore: pathsCompletenessScore,
    completenessIssues: getCompletenessIssues(issuesByArea.paths),
    sdkGenerationScore: pathsSdkGenerationScore,
    sdkGenerationIssues: getSdkGenerationIssues(issuesByArea.paths),
    securityScore: pathsSecurityScore,
    securityIssues: getSecurityIssues(issuesByArea.paths),
    ...pathRatings,
  };

  // TODO: Incorporate components rating
  const componentsRating = getComponentsRatings(
    openApi,
    issuesByArea.components,
  );

  const infoObjectRating = getAreaRating(issuesByArea.info);

  const tagsRating: Rating = openApi.tags?.length
    ? getLengthNormalizedAreaRating(issuesByArea.tags, openApi.tags?.length)
    : // Tags are not mandatory, but you should use them
      {
        score: 25,
        issues: issuesByArea.tags,
        docsScore: 25,
        docsIssues: getDocsIssues(issuesByArea.tags),
        completenessScore: 25,
        completenessIssues: getCompletenessIssues(issuesByArea.tags),
        sdkGenerationScore: 100,
        sdkGenerationIssues: getSdkGenerationIssues(issuesByArea.tags),
        securityScore: 100,
        securityIssues: getSecurityIssues(issuesByArea.tags),
      };

  const serversRating: Rating = openApi.servers?.length
    ? getLengthNormalizedAreaRating(
        issuesByArea.servers,
        openApi.servers.length,
      )
    : // You should always define servers - big fail!
      {
        score: 0,
        issues: issuesByArea.servers,
        docsScore: 0,
        docsIssues: getDocsIssues(issuesByArea.servers),
        completenessScore: 0,
        completenessIssues: getCompletenessIssues(issuesByArea.servers),
        sdkGenerationScore: 0,
        sdkGenerationIssues: getSdkGenerationIssues(issuesByArea.servers),
        securityScore: 0,
        securityIssues: getSecurityIssues(issuesByArea.servers),
      };

  const securityRating: Rating = openApi.security?.length
    ? getLengthNormalizedAreaRating(
        issuesByArea.security,
        openApi.security.length,
      )
    : // Security is not a mandatory property, but chances are the API is

      // secured in some way, but they just didn't document it, so we count this
      // as a fail. Security can also be documented at the operation
      // level, but should also be documented at the top level in most cases,
      // even if its just an empty array
      {
        score: 0,
        issues: issuesByArea.security,
        docsScore: 0,
        docsIssues: getDocsIssues(issuesByArea.security),
        completenessScore: 0,
        completenessIssues: getCompletenessIssues(issuesByArea.security),
        sdkGenerationScore: 100,
        sdkGenerationIssues: getSdkGenerationIssues(issuesByArea.security),
        securityScore: 0,
        securityIssues: getSecurityIssues(issuesByArea.security),
      };

  return {
    issues: outputReport,
    processingErrors,
    docsIssues: getDocsIssues(outputReport),
    completenessIssues: getCompletenessIssues(outputReport),
    sdkGenerationIssues: getSdkGenerationIssues(outputReport),
    securityIssues: getSecurityIssues(outputReport),
    paths: pathsRating,
    info: infoObjectRating,
    servers: serversRating,
    tags: tagsRating,
    security: securityRating,
    components: componentsRating,
    score: Math.round(
      pathsScore * OPEN_API_PROPERTY_WEIGHTS.paths +
        tagsRating.score * OPEN_API_PROPERTY_WEIGHTS.tags +
        serversRating.score * OPEN_API_PROPERTY_WEIGHTS.servers +
        securityRating.score * OPEN_API_PROPERTY_WEIGHTS.security +
        infoObjectRating.score * OPEN_API_PROPERTY_WEIGHTS.info +
        componentsRating.score * OPEN_API_PROPERTY_WEIGHTS.components,
    ),
    docsScore: Math.round(
      pathsDocsScore * OPEN_API_PROPERTY_WEIGHTS.paths +
        tagsRating.docsScore * OPEN_API_PROPERTY_WEIGHTS.tags +
        serversRating.docsScore * OPEN_API_PROPERTY_WEIGHTS.servers +
        securityRating.docsScore * OPEN_API_PROPERTY_WEIGHTS.security +
        infoObjectRating.docsScore * OPEN_API_PROPERTY_WEIGHTS.info +
        componentsRating.docsScore * OPEN_API_PROPERTY_WEIGHTS.components,
    ),
    completenessScore: Math.round(
      pathsCompletenessScore * OPEN_API_PROPERTY_WEIGHTS.paths +
        tagsRating.completenessScore * OPEN_API_PROPERTY_WEIGHTS.tags +
        serversRating.completenessScore * OPEN_API_PROPERTY_WEIGHTS.servers +
        securityRating.completenessScore * OPEN_API_PROPERTY_WEIGHTS.security +
        infoObjectRating.completenessScore * OPEN_API_PROPERTY_WEIGHTS.info +
        componentsRating.completenessScore *
          OPEN_API_PROPERTY_WEIGHTS.components,
    ),
    sdkGenerationScore: Math.round(
      pathsSdkGenerationScore * OPEN_API_PROPERTY_WEIGHTS.paths +
        tagsRating.sdkGenerationScore * OPEN_API_PROPERTY_WEIGHTS.tags +
        serversRating.sdkGenerationScore * OPEN_API_PROPERTY_WEIGHTS.servers +
        securityRating.sdkGenerationScore * OPEN_API_PROPERTY_WEIGHTS.security +
        infoObjectRating.sdkGenerationScore * OPEN_API_PROPERTY_WEIGHTS.info +
        componentsRating.sdkGenerationScore *
          OPEN_API_PROPERTY_WEIGHTS.components,
    ),
    securityScore: Math.round(
      pathsSecurityScore * OPEN_API_PROPERTY_WEIGHTS.paths +
        tagsRating.securityScore * OPEN_API_PROPERTY_WEIGHTS.tags +
        serversRating.securityScore * OPEN_API_PROPERTY_WEIGHTS.servers +
        securityRating.securityScore * OPEN_API_PROPERTY_WEIGHTS.security +
        infoObjectRating.securityScore * OPEN_API_PROPERTY_WEIGHTS.info +
        componentsRating.securityScore * OPEN_API_PROPERTY_WEIGHTS.components,
    ),
  };
}

/**
 * @description Calculated the ratings for each path and operation in the API.
 * The scores are normalized by the size of the API so large OpenAPIs don't get
 * penalized for having the same issue multiple times.
 */
function getPathRatings(
  openApi: OpenAPIV3_1.Document | OpenAPIV3.Document,
  pathsIssues: SpectralReport,
) {
  const operations = [
    "get",
    "put",
    "post",
    "delete",
    "options",
    "head",
    "patch",
    "trace",
  ] as OpenAPIV3_1.HttpMethods[];

  // Grab the path/operation issues first as they are the bulk of the API
  const issuesByPathAndOperation = pathsIssues.reduce(
    (issuesByPathAndOperation, pathIssue) => {
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
      const operation =
        pathIssue.path[2] &&
        operations.includes(pathIssue.path[2] as OpenAPIV3_1.HttpMethods)
          ? (pathIssue.path[2] as OpenAPIV3_1.HttpMethods)
          : "other";

      issuesByPathAndOperation[path][operation].push(pathIssue);
      return issuesByPathAndOperation;
    },
    {} as Record<
      string,
      Record<OpenAPIV3_1.HttpMethods | "other", SpectralReport>
    >,
  );

  const { paths } = openApi;
  if (!paths) {
    throw new Error("No paths found in OpenAPI file");
  }

  // We iterate through the paths to calculate a score for each one and then
  // average them to get the overall score for the API's paths
  return Object.entries(paths).reduce(
    (pathRatings, [path, pathItem]) => {
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

      const pathRating: PathRating = {
        score: 100,
        issues: issuesByPathAndOperation[path]["other"],
        docsScore: 100,
        docsIssues: getDocsIssues(issuesByPathAndOperation[path]["other"]),
        completenessScore: 100,
        completenessIssues: getCompletenessIssues(
          issuesByPathAndOperation[path]["other"],
        ),
        sdkGenerationScore: 100,
        sdkGenerationIssues: getSdkGenerationIssues(
          issuesByPathAndOperation[path]["other"],
        ),
        securityScore: 100,
        securityIssues: getSecurityIssues(
          issuesByPathAndOperation[path]["other"],
        ),
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

        const docsIssues = getDocsIssues(operationIssues);
        const docsScore = getNormalizedOperationRating(
          operationItem,
          docsIssues,
        );
        const completenessIssues = getCompletenessIssues(operationIssues);
        const completenessScore = getNormalizedOperationRating(
          operationItem,
          completenessIssues,
        );
        const sdkGenerationIssues = getSdkGenerationIssues(operationIssues);
        const sdkGenerationScore = getNormalizedOperationRating(
          operationItem,
          sdkGenerationIssues,
        );
        const securityIssues = getSecurityIssues(operationIssues);
        const securityScore = getNormalizedOperationRating(
          operationItem,
          securityIssues,
        );
        pathRating[operation] = {
          score: Math.round(
            (docsScore +
              completenessScore +
              sdkGenerationScore +
              securityScore) /
              4,
          ),
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
      const numOperations = Object.keys(pathRating).filter((key) =>
        operations.includes(key as OpenAPIV3_1.HttpMethods),
      ).length;
      if (numOperations) {
        let totalDocsScore = 0;
        let totalCompletenessScore = 0;
        let totalSdkGenerationScore = 0;
        let totalSecurityScore = 0;
        Object.entries(pathRating).forEach(([key, maybeOperationRating]) => {
          if (!operations.includes(key as OpenAPIV3_1.HttpMethods)) {
            // Non-operation key (ex. issues, score, etc.)
            return;
          }
          const operationRating = maybeOperationRating as Rating;
          totalDocsScore = totalDocsScore + operationRating.docsScore;
          totalCompletenessScore =
            totalCompletenessScore + operationRating.completenessScore;
          totalSdkGenerationScore =
            totalSdkGenerationScore + operationRating.sdkGenerationScore;
          totalSecurityScore =
            totalSecurityScore + operationRating.securityScore;
        });

        // We must also account for issues on the path itself
        const pathIssues = issuesByPathAndOperation[path]["other"];

        pathRating.docsScore = Math.round(
          totalDocsScore / numOperations -
            getPathIssueDelta(getDocsIssues(pathIssues)),
        );
        pathRating.completenessScore = Math.round(
          totalCompletenessScore / numOperations -
            getPathIssueDelta(getCompletenessIssues(pathIssues)),
        );
        pathRating.sdkGenerationScore = Math.round(
          totalSdkGenerationScore / numOperations -
            getPathIssueDelta(getSdkGenerationIssues(pathIssues)),
        );
        pathRating.securityScore = Math.round(
          totalSecurityScore / numOperations -
            getPathIssueDelta(getSecurityIssues(pathIssues)),
        );
        pathRating.score = Math.round(
          (pathRating.docsScore +
            pathRating.completenessScore +
            pathRating.sdkGenerationScore +
            pathRating.securityScore) /
            4,
        );
      } else {
        pathRating.score = 0; // Wtf, why document a path with no operations - FAIL
        pathRating.docsScore = 0;
        pathRating.completenessScore = 0;
        pathRating.sdkGenerationScore = 0;
        pathRating.securityScore = 0;
      }

      pathRatings[path] = pathRating;
      return pathRatings;
    },
    {} as Record<string, PathRating>,
  );
}

/**
 * @description Generates a rating for an Operation, normalizing the score based
 * on how many properties exist on the operation and how many issues were found
 * on those properties.
 */
function getNormalizedOperationRating(
  operationItem: OpenAPIV3_1.OperationObject | OpenAPIV3.OperationObject,
  operationIssues: SpectralReport,
) {
  // We calculate the operation score by normalizing the penalties of list
  // properties on the operation. Responses tags, and parameters issues are all
  // divided by the number of items in that property.
  // Ex. making a mistake on only 1 of 5 parameters should not
  // affect the score as much as making a mistake on all of them.
  // One can argue that this encourages people to not document responses rather
  // than document them poorly, but we have rules in place to make sure certain
  // responses are documented (ex. 2XX and 4XX), so this should not be a problem
  let score = 100;
  operationIssues.forEach((issue) => {
    const scoreDelta = getScoreDelta(issue.severity);
    const property = issue.path[3] as string | undefined;

    if (property?.startsWith("parameters")) {
      const parameterCount = operationItem.parameters
        ? operationItem.parameters.length
        : 1;
      score = Math.max(0, score - scoreDelta / parameterCount);
      return;
    }

    if (property === "responses") {
      const responseCount = operationItem.responses
        ? Object.keys(operationItem.responses).length
        : 1;
      const responseCode = issue.path[4] as string | undefined;
      // If the issue is specific to a response, we normalize
      if (responseCode) {
        score = Math.max(0, score - scoreDelta / responseCount);
        return;
      }

      score = Math.max(0, score - scoreDelta);
      return;
    }

    if (property?.startsWith("tags")) {
      const tagCount = operationItem.tags ? operationItem.tags.length : 1;
      score = Math.max(0, score - scoreDelta / tagCount);
      return;
    }

    score = Math.max(0, score - scoreDelta);
  });

  return Math.round(score);
}

function getComponentsRatings(
  openApi: OpenAPIV3_1.Document | OpenAPIV3.Document,
  componentsIssues: SpectralReport,
): ComponentsRating {
  const { components } = openApi;
  if (!components) {
    // No components, no problems
    return {
      score: 100,
      issues: componentsIssues,
      docsScore: 100,
      docsIssues: getDocsIssues(componentsIssues),
      completenessScore: 100,
      completenessIssues: getCompletenessIssues(componentsIssues),
      sdkGenerationScore: 0,
      sdkGenerationIssues: getSdkGenerationIssues(componentsIssues),
      securityScore: 100,
      securityIssues: getSecurityIssues(componentsIssues),
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
  ] as (keyof OpenAPIV3.ComponentsObject)[];

  const issuesByComponent = componentsIssues.reduce(
    (issuesByComponent, componentIssue) => {
      const componentKey = componentIssue
        .path[1] as keyof OpenAPIV3.ComponentsObject;
      if (!issuesByComponent[componentKey]) {
        issuesByComponent[componentKey] = {};
      }
      // Will never be a number in practice, so we can safely cast to string
      let componentName = componentIssue.path.at(2) as string | undefined;
      if (!componentName) {
        console.warn(
          "Found component issue with no component name. Skipping.",
          componentIssue,
        );
        return issuesByComponent;
      }

      const categoryComponents = components[componentKey];
      if (categoryComponents && !categoryComponents[componentName]) {
        const componentNamePathSegments = componentIssue.path.slice(3);
        let tempComponentName = componentName;
        let trueComponentName = undefined;
        // Likely caused by https://github.com/daveshanley/vacuum/issues/295
        // Essentially . delimited component names are not supported by Vacuum
        for (const pathSegment of componentNamePathSegments) {
          if (typeof pathSegment === "number") {
            break;
          }
          // We build up the true component name by appending the path segments
          tempComponentName = `${tempComponentName}.${pathSegment}`;
          if (categoryComponents[tempComponentName]) {
            trueComponentName = tempComponentName;
            break;
          }
        }
        if (!trueComponentName) {
          console.warn(
            "Found component issue with incorrect component name. Skipping.",
            componentIssue,
          );
          return issuesByComponent;
        }
        componentName = trueComponentName;
      }

      if (!issuesByComponent[componentKey][componentName]) {
        issuesByComponent[componentKey][componentName] = [];
      }
      issuesByComponent[componentKey][componentName].push(componentIssue);
      return issuesByComponent;
    },
    {} as Record<
      keyof OpenAPIV3.ComponentsObject,
      Record<string, SpectralReport>
    >,
  );

  // We iterate through the components to calculate a score for each one and
  // then average them to get the overall score for the API's components
  const componentCategoryRatings = componentCategoryKeys.reduce(
    (componentCategoryRatings, componentKey) => {
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
      const componentCategoryRating: ComponentRating = {
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
      const componentRatings: Record<string, Rating> = Object.keys(
        componentCategory,
      ).reduce(
        (componentsRatings, componentName) => {
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
          const { docsScore, docsIssues } = getDocsRating(componentIssues);
          const { completenessScore, completenessIssues } =
            getCompletenessRating(componentIssues);
          const { sdkGenerationScore, sdkGenerationIssues } =
            getSdkGenerationRating(componentIssues);
          const { securityScore, securityIssues } =
            getSecurityRating(componentIssues);
          componentsRatings[componentName] = {
            score: Math.round(
              (docsScore +
                completenessScore +
                sdkGenerationScore +
                securityScore) /
                4,
            ),
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
            componentCategoryRating.completenessIssues.concat(
              completenessIssues,
            );
          componentCategoryRating.sdkGenerationIssues =
            componentCategoryRating.sdkGenerationIssues.concat(
              sdkGenerationIssues,
            );
          componentCategoryRating.securityIssues =
            componentCategoryRating.securityIssues.concat(securityIssues);
          return componentsRatings;
        },
        {} as Record<string, Rating>,
      );
      let totalComponentsDocsScore = 0;
      let totalCompletenessScore = 0;
      let totalSdkGenerationScore = 0;
      let totalSecurityScore = 0;
      Object.values(componentRatings).forEach((componentRating) => {
        totalComponentsDocsScore =
          totalComponentsDocsScore + componentRating.docsScore;
        totalCompletenessScore =
          totalCompletenessScore + componentRating.completenessScore;
        totalSdkGenerationScore =
          totalSdkGenerationScore + componentRating.sdkGenerationScore;
        totalSecurityScore = totalSecurityScore + componentRating.securityScore;
      });
      const componentCategoryDocsScore = Math.round(
        totalComponentsDocsScore / Object.keys(componentRatings).length,
      );
      const componentCategoryCompletenessScore = Math.round(
        totalCompletenessScore / Object.keys(componentRatings).length,
      );
      const componentCategorySdkGenerationScore = Math.round(
        totalSdkGenerationScore / Object.keys(componentRatings).length,
      );
      const componentCategorySecurityScore = Math.round(
        totalSecurityScore / Object.keys(componentRatings).length,
      );
      componentCategoryRatings[componentKey] = {
        score: Math.round(
          (componentCategoryDocsScore +
            componentCategoryCompletenessScore +
            componentCategorySdkGenerationScore +
            componentCategorySecurityScore) /
            4,
        ),
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
    },
    {} as Record<keyof OpenAPIV3.ComponentsObject, ComponentRating>,
  );
  let totalComponentsCategoryDocsScore = 0;
  let totalComponentsCategoryCompletenessScore = 0;
  let totalComponentsCategorySdkGenerationScore = 0;
  let totalComponentsCategorySecurityScore = 0;
  Object.values(componentCategoryRatings).forEach((rating) => {
    totalComponentsCategoryDocsScore =
      totalComponentsCategoryDocsScore + rating.docsScore;
    totalComponentsCategoryCompletenessScore =
      totalComponentsCategoryCompletenessScore + rating.completenessScore;
    totalComponentsCategorySdkGenerationScore =
      totalComponentsCategorySdkGenerationScore + rating.sdkGenerationScore;
    totalComponentsCategorySecurityScore =
      totalComponentsCategorySecurityScore + rating.securityScore;
  });
  const componentsDocsScore = Math.round(
    totalComponentsCategoryDocsScore /
      Object.keys(componentCategoryRatings).length,
  );
  const componentsCompletenessScore = Math.round(
    totalComponentsCategoryCompletenessScore /
      Object.keys(componentCategoryRatings).length,
  );
  const componentsSdkGenerationScore = Math.round(
    totalComponentsCategorySdkGenerationScore /
      Object.keys(componentCategoryRatings).length,
  );
  const componentsSecurityScore = Math.round(
    totalComponentsCategorySecurityScore /
      Object.keys(componentCategoryRatings).length,
  );

  return {
    score: Math.round(
      (componentsDocsScore +
        componentsCompletenessScore +
        componentsSdkGenerationScore +
        componentsSecurityScore) /
        4,
    ),
    issues: componentsIssues,
    docsScore: componentsDocsScore,
    docsIssues: getDocsIssues(componentsIssues),
    completenessScore: componentsCompletenessScore,
    completenessIssues: getCompletenessIssues(componentsIssues),
    sdkGenerationScore: componentsSdkGenerationScore,
    sdkGenerationIssues: getSdkGenerationIssues(componentsIssues),
    securityScore: componentsSecurityScore,
    securityIssues: getSecurityIssues(componentsIssues),
    ...componentCategoryRatings,
  };
}

function getAreaRating(areaIssues: SpectralReport): Rating {
  return getLengthNormalizedAreaRating(areaIssues, 1);
}

function getLengthNormalizedAreaRating(
  areaIssues: SpectralReport,
  areaLength: number,
): Rating {
  const { docsScore, docsIssues } = getLengthNormalizedDocsRating(
    areaIssues,
    areaLength,
  );
  const { completenessScore, completenessIssues } =
    getLengthNormalizedCompletenessRating(areaIssues, areaLength);
  const { sdkGenerationScore, sdkGenerationIssues } =
    getLengthNormalizedSdkGenerationRating(areaIssues, areaLength);
  const { securityScore, securityIssues } = getLengthNormalizedSecurityRating(
    areaIssues,
    areaLength,
  );
  return {
    score: Math.round(
      (docsScore + completenessScore + sdkGenerationScore + securityScore) / 4,
    ),
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
}

// How heavily should each issue impact the score?
// Nothing is scientific here - I made these up
export function getScoreDelta(severity: 0 | 1 | 2 | 3) {
  switch (severity) {
    case 0:
      return 75; // Essentially an error so judged harshly
    case 1:
      return 25; // Warning, likely affects end-user experience
    case 2:
      return 10; // Info, may not affect end-user
    case 3:
      return 5; // Hint, prescriptive suggestions essentially
  }
}

// Issues discovered at the paths level, that affect all operations
function getPathIssueDelta(pathIssues: SpectralReport) {
  return pathIssues.reduce((pathIssueDeltaSum, pathIssue) => {
    return pathIssueDeltaSum + getScoreDelta(pathIssue.severity);
  }, 0);
}

/**
 * Sometimes vacuum/spectral mess up the path, but we can try and figure out
 * what part of the file they are referring to
 */
function inferAreaFromIssue(issue: SpectralReport[0]): string | undefined {
  if (issue.path.length > 0) {
    const areaHint = issue.path[0].toString();
    if (areaHint.includes("info")) {
      return "info";
    } else if (areaHint.includes("server")) {
      return "servers";
    } else if (areaHint.includes("path")) {
      return "paths";
    } else if (areaHint.includes("component")) {
      return "components";
    } else if (areaHint.includes("security")) {
      return "security";
    } else if (areaHint.includes("tag")) {
      return "tags";
    }
  }

  if (typeof issue.code !== "string") {
    return undefined;
  }

  // The path can be empty for top-level issues
  if (issue.code.includes("info")) {
    return "info";
  } else if (issue.code.includes("server")) {
    return "servers";
  } else if (issue.code.includes("path")) {
    return "paths";
  } else if (issue.code.includes("component")) {
    return "components";
  } else if (issue.code.includes("security")) {
    return "security";
  } else if (issue.code.includes("tag")) {
    return "tags";
  }
  return undefined;
}
