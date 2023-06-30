import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { ComponentRating, ComponentsRating, PathRating, Rating, RatingOutput, SpectralReport } from "./interfaces";


// NOTE: Should sum to 1
const OPEN_API_PROPERTY_WEIGHTS = {
  info: 0.1,
  servers: 0.05,
  tags: 0.05,
  security: 0.05,
  paths: 0.6,
  components: 0.15,
};

export const generateOpenApiRating = (
  outputReport: SpectralReport,
  openApi: OpenAPIV3_1.Document | OpenAPIV3.Document
): RatingOutput => {
  const issuesByArea = outputReport.reduce((issuesByArea, issue) => {
    const area = issue.path[0] as keyof typeof issuesByArea;
    if (!issuesByArea[area]) {
      // TODO: Not sure when this would happen, should collect some telemetry
      // on this to see if it's a problem
      issuesByArea[area] = [];
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
    other: [],
  } as {
    components: SpectralReport;
    paths: SpectralReport;
    security: SpectralReport;
    tags: SpectralReport;
    info: SpectralReport;
    servers: SpectralReport;
  });

  const pathRatings = getPathRatings(openApi, issuesByArea.paths);
  const totalPathsScore = Object.values(pathRatings).reduce(
    (sum, pathRating) => {
      return sum + pathRating.score;
    },
    0,
  );
  const pathsScore = Math.round(
    totalPathsScore / Object.keys(pathRatings).length,
  );
  const pathsScoreWeighted = pathsScore * OPEN_API_PROPERTY_WEIGHTS.paths;

  // TODO: Incorporate components rating
  const componentsRating = getComponentsRatings(
    openApi,
    issuesByArea.components,
  );
  const componentsScore = componentsRating.score *
    OPEN_API_PROPERTY_WEIGHTS.components;

  const infoObjectRating = getAreaRating(issuesByArea.info);
  const infoScore = infoObjectRating.score * OPEN_API_PROPERTY_WEIGHTS.info;

  const tagsRating = openApi.tags?.length
    ? getLengthNormalizedAreaRating(issuesByArea.tags, openApi.tags?.length)
    // Having no tags is not mandatory, so we count this as a single warning
    // TODO: Should we penalize harder for having more paths?
    : { score: 85, issues: issuesByArea.tags };
  const tagsScore = tagsRating.score * OPEN_API_PROPERTY_WEIGHTS.tags;

  const serversRating = openApi.servers?.length
    ? getLengthNormalizedAreaRating(
      issuesByArea.servers,
      openApi.servers.length,
    )
    // You should always define servers
    : { score: 0, issues: issuesByArea.servers };
  const serversScore = serversRating.score * OPEN_API_PROPERTY_WEIGHTS.servers;

  const securityRating = openApi.security?.length
    ? getLengthNormalizedAreaRating(
      issuesByArea.security,
      openApi.security.length,
    )
    // Security is not a mandatory property, but chances are the API is
    // secured in some way, but they just didn't document it,  so we count this
    // as a single warning
    : { score: 85, issues: issuesByArea.security };
  const securityScore = securityRating.score *
    OPEN_API_PROPERTY_WEIGHTS.security;

  return {
    issues: outputReport,
    paths: { score: pathsScore, issues: issuesByArea.paths, ...pathRatings },
    info: infoObjectRating,
    servers: serversRating,
    tags: tagsRating,
    security: securityRating,
    components: componentsRating,
    score: Math.round(
      pathsScoreWeighted + tagsScore + serversScore + securityScore +
        infoScore +
        componentsScore,
    ),
  };
};

/**
 * @description Calculated the ratings for each path and operation in the API.
 * The scores are normalized by the size of the API so large OpenAPIs don't get
 * penalized for having the same issue multiple times.
 */
const getPathRatings = (
  openApi:
    | OpenAPIV3_1.Document
    | OpenAPIV3.Document,
  pathsIssues: SpectralReport,
) => {
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
      const operation = pathIssue.path[2] && operations.includes(
        (pathIssue.path[2] as OpenAPIV3_1.HttpMethods) 
      )
        ? (pathIssue.path[2] as OpenAPIV3_1.HttpMethods)
        : "other";

      issuesByPathAndOperation[path][operation].push(pathIssue);
      return issuesByPathAndOperation;
    },
    {} as Record<
      string,
      Record<OpenAPIV3_1.HttpMethods | "other", SpectralReport>
    >
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
        pathRatings[path] = {
          score: 100,
          issues: [],
        };
        return pathRatings;
      }

      let pathRating: PathRating = {
        score: 100,
        issues: issuesByPathAndOperation[path]["other"],
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
          };
          return;
        }

        // We calculate the operation score by averaging the scores of the
        // key properties of the operation

        // TODO: Add vacuum rule for summary
        // let summaryScore = operationItem.summary ? 100 : 0;
        let averagingDenominator = 2;
        let descriptionScore = operationItem.description ? 100 : 0;
        let responsesScore = 100;
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
        // TODO: Incorporate issues on tags, operationId, and security
        operationIssues.forEach((issue) => {
          const scoreDelta = getScoreDelta(issue.severity);
          const property = issue.path[3] as string | undefined;
          if (!property) {
            if (
              typeof issue.code === "string" &&
              issue.code.includes("description")
            ) {
              descriptionScore = Math.max(0, descriptionScore - scoreDelta);
            }
            return;
          }
          if (
            property?.startsWith("parameters") &&
            parametersScore &&
            operationItem.parameters
          ) {
            parametersScore = Math.max(
              0,
              // Normalize the scoreDelta by the number of parameters
              // Ex. making a mistake on only 1 of 5 parameters should not
              // affect the score as much as making a mistake on all of them
              parametersScore - scoreDelta / operationItem.parameters.length
            );
            return;
          }
          if (property === "requestBody" && requestBodyScore) {
            requestBodyScore = Math.max(0, requestBodyScore - scoreDelta);
            return;
          }
          if (property === "responses") {
            responsesScore = Math.max(
              0,
              // Same normalization as for parameters
              responsesScore -
                scoreDelta / Object.keys(operationItem.responses).length
            );
            return;
          }
        });
        const operationScore = Math.round(
          (descriptionScore +
            responsesScore +
            (requestBodyScore ?? 0) +
            (parametersScore ?? 0)) /
            averagingDenominator
        );
        pathRating[operation] = {
          score: operationScore,
          issues: operationIssues,
        };
        pathRating.issues = pathRating.issues.concat(operationIssues);
      });

      const pathIssues = issuesByPathAndOperation[path]["other"];
      const pathIssuesDelta = getPathIssueDelta(pathIssues);
      // Remove score and issues keys
      const numOperations = Object.keys(pathRating).length - 2;
      if (numOperations) {
        const totalScore = Object.entries(pathRating).reduce(
          (sum, [operation, operationRating]) => {
            if (operation === "score" || operation === "issues") {
              return sum;
            }
            return sum + (operationRating as Rating).score;
          },
          0
        );
        pathRating.score = Math.round(
          totalScore / numOperations - pathIssuesDelta
        );
      } else {
        pathRating.score = 0; // Wtf, why document a path with no operations - FAIL
      }

      pathRatings[path] = pathRating;
      return pathRatings;
    },
    {} as Record<string, PathRating>
  );
};

const getComponentsRatings = (
  openApi:
    | OpenAPIV3_1.Document
    | OpenAPIV3.Document,
  componentsIssues: SpectralReport,
): ComponentsRating => {
  const { components } = openApi;
  if (!components) {
    return {
      score: 100,
      issues: componentsIssues,
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
      const componentName = componentIssue.path.at(2) as string | undefined;
      if (!componentName) {
        console.warn(
          "Found component issue with no component name. Skipping.",
          componentIssue,
        );
        return issuesByComponent;
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
        componentCategoryRatings[componentKey] = {
          score: 100,
          issues: [],
        };
        return componentCategoryRatings;
      }
      let componentCategoryRating: ComponentRating = {
        score: 100,
        issues: [],
      };
      const componentRatings: Record<string, Rating> = Object.keys(
        componentCategory,
      ).reduce(
        (componentsRatings, componentName) => {
          const componentIssues = componentCategoryIssues[componentName];
          if (!componentIssues) {
            componentsRatings[componentName] = {
              score: 100,
              issues: [],
            };
            return componentsRatings;
          }
          let componentScore = 100;
          componentIssues.forEach((issue) => {
            const delta = getScoreDelta(issue.severity);
            componentScore = Math.max(0, componentScore - delta);
          });
          componentsRatings[componentName] = {
            score: componentScore,
            issues: componentIssues,
          };
          componentCategoryRating.issues = componentCategoryRating.issues
            .concat(componentIssues);
          return componentsRatings;
        },
        {} as Record<string, Rating>,
      );
      const componentCategoryScore = Math.round(
        Object.values(componentRatings).reduce(
          (componentCategoryScore, componentRating) => {
            return componentCategoryScore + componentRating.score;
          },
          0,
        ) / Object.keys(componentRatings).length,
      );
      componentCategoryRatings[componentKey] = {
        score: componentCategoryScore,
        issues: componentCategoryRating.issues,
        ...componentRatings,
      };
      return componentCategoryRatings;
    },
    {} as Record<keyof OpenAPIV3.ComponentsObject, ComponentRating>,
  );
  const componentCategoryTotalScores = Object.values(componentCategoryRatings)
    .reduce((sum, rating) => sum + rating.score, 0);
  const componentsScore = Math.round(
    componentCategoryTotalScores / Object.keys(componentCategoryRatings).length,
  );
  return {
    score: componentsScore,
    issues: componentsIssues,
    ...componentCategoryRatings,
  };
};

const getAreaRating = (
  areaIssues: SpectralReport,
): Rating => {
  let areaScore = 100;
  areaIssues.forEach((issue) => {
    const delta = getScoreDelta(issue.severity);
    areaScore = Math.max(0, areaScore - delta);
  });
  return {
    score: areaScore,
    issues: areaIssues,
  };
};

const getLengthNormalizedAreaRating = (
  areaIssues: SpectralReport,
  areaLength: number,
): Rating => {
  const totalDelta = areaIssues.reduce((totalPenalty, issue) => {
    const delta = getScoreDelta(issue.severity);
    return totalPenalty - delta;
  }, 0);

  return {
    score: Math.max(0, 100 - (totalDelta / areaLength)),
    issues: areaIssues,
  };
};

const getScoreDelta = (severity: 0 | 1 | 2 | 3) => {
  switch (severity) {
    case 0:
      return 50; // Essentially an error so judged harshly
    case 1:
      return 15; // Warning, likely affects end-user experience
    case 2:
      return 5; // Info, may not affect end-user
    case 3:
      return 1; // Hint, prescriptive suggestions essentially
  }
};

const getPathIssueDelta = (pathIssues: SpectralReport) => {
  const pathIssuesBySeverity = pathIssues.reduce(
    (pathIssuesBySeverity, pathIssue) => {
      pathIssuesBySeverity[pathIssue.severity].push(pathIssue);
      return pathIssuesBySeverity;
    },
    { 0: [], 1: [], 2: [], 3: [] } as Record<0 | 1 | 2 | 3, SpectralReport>
  );
  if (pathIssuesBySeverity[0].length) {
    // You have an error, that likely affects your all your operations
    return getScoreDelta(0);
  }
  if (pathIssuesBySeverity[1].length) {
    return 5 * pathIssuesBySeverity[1].length;
  }
  if (pathIssuesBySeverity[2].length) {
    return pathIssuesBySeverity[2].length;
  }
  if (pathIssuesBySeverity[3].length) {
    return Math.round(pathIssuesBySeverity[3].length * 0.1);
  }
  return 0;
};
