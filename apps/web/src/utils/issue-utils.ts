const getVacuumIssueUrl = (pathFragment: string, issueCode: string) =>
  `https://quobix.com/vacuum/rules/${pathFragment}/${issueCode}`;

const RULE_DESCRIPTIONS: Record<
  string,
  { description: string; url: string; violationExplanation?: string }
> = {
  "apimatic-security-defined": {
    url: "https://www.apimatic.io/blog/2022/11/14-best-practices-to-write-openapi-for-better-api-consumption#:~:text=6.%20At%20Least%20One%20Security%20Scheme",
    description:
      "Apimatic: It is recommended to define at least one authentication scheme globally using the securitySchemes property in the components section and use it globally to authenticate all the endpoints or use it for specific endpoints.",
  },
  "apimatic-operationId-max-length": {
    url: "https://www.apimatic.io/blog/2022/11/14-best-practices-to-write-openapi-for-better-api-consumption#:~:text=2.%20Titles%2C%20Names%2C%20And%20Summaries%20Should%20Not%20Exceed%2050%20Characters",
    description:
      "Apimatic: Longer content can lead to issues in the code generation process. It's best to keep the length to a maximum of 50 characters, wherever possible.",
  },
  "apimatic-parameter-name-max-length": {
    url: "https://www.apimatic.io/blog/2022/11/14-best-practices-to-write-openapi-for-better-api-consumption#:~:text=2.%20Titles%2C%20Names%2C%20And%20Summaries%20Should%20Not%20Exceed%2050%20Characters",
    description:
      "Apimatic: Longer content can lead to issues in the code generation process. It's best to keep the length to a maximum of 50 characters, wherever possible.",
  },
  "apimatic-header-name-max-length": {
    url: "https://www.apimatic.io/blog/2022/11/14-best-practices-to-write-openapi-for-better-api-consumption#:~:text=2.%20Titles%2C%20Names%2C%20And%20Summaries%20Should%20Not%20Exceed%2050%20Characters",
    description:
      "Apimatic: Longer content can lead to issues in the code generation process. It's best to keep the length to a maximum of 50 characters, wherever possible.",
  },
  "apimatic-component-name-max-length": {
    url: "https://www.apimatic.io/blog/2022/11/14-best-practices-to-write-openapi-for-better-api-consumption#:~:text=2.%20Titles%2C%20Names%2C%20And%20Summaries%20Should%20Not%20Exceed%2050%20Characters",
    description:
      "Apimatic: Longer content can lead to issues in the code generation process. It's best to keep the length to a maximum of 50 characters, wherever possible.",
  },
  "apimatic-no-inline-response-schema": {
    url: "https://www.apimatic.io/blog/2022/11/14-best-practices-to-write-openapi-for-better-api-consumption#:~:text=3.%20No%20Inline%20Schemas%20Definition",
    description:
      "Apimatic: In general, inline schemas are not encouraged in code generators and API portal generators since their names are inferred from the parent node in which they are defined inline.",
  },
  "apimatic-no-inline-parameter-schema": {
    url: "https://www.apimatic.io/blog/2022/11/14-best-practices-to-write-openapi-for-better-api-consumption#:~:text=3.%20No%20Inline%20Schemas%20Definition",
    description:
      "Apimatic: In general, inline schemas are not encouraged in code generators and API portal generators since their names are inferred from the parent node in which they are defined inline.",
  },
  "apimatic-no-inline-request-body-schema": {
    url: "https://www.apimatic.io/blog/2022/11/14-best-practices-to-write-openapi-for-better-api-consumption#:~:text=3.%20No%20Inline%20Schemas%20Definition",
    description:
      "Apimatic: In general, inline schemas are not encouraged in code generators and API portal generators since their names are inferred from the parent node in which they are defined inline.",
  },
  "owasp:api1:2019-no-numeric-ids": {
    url: "https://github.com/stoplightio/spectral-owasp-ruleset/blob/main/src/ruleset.ts#L102",
    description:
      "OWASP API1:2019 - Use random IDs that cannot be guessed. UUIDs are preferred.",
  },
  "owasp:api2:2019-no-http-basic": {
    url: "https://github.com/stoplightio/spectral-owasp-ruleset/blob/main/src/ruleset.ts#L154",
    description:
      "Basic authentication credentials transported over network are more susceptible to interception than other forms of authentication, and as they are not encrypted it means passwords and tokens are more easily leaked.",
  },
  "owasp:api3:2019-define-error-responses-401": {
    url: "https://github.com/stoplightio/spectral-owasp-ruleset/blob/main/src/ruleset.ts#L376",
    description:
      "OWASP API Security recommends defining schemas for all responses, even errors. The 401 describes what happens when a request is unauthorized, so its important to define this not just for documentation, but to empower contract testing to make sure the proper JSON structure is being returned instead of leaking implementation details in backtraces.",
  },
  "owasp:api3:2019-define-error-responses-500": {
    url: "https://github.com/stoplightio/spectral-owasp-ruleset/blob/main/src/ruleset.ts#L397",
    description:
      "OWASP API Security recommends defining schemas for all responses, even errors. The 500 describes what happens when a request fails with an internal server error, so its important to define this not just for documentation, but to empower contract testing to make sure the proper JSON structure is being returned instead of leaking implementation details in backtraces.",
  },
  "owasp:api4:2019-rate-limit": {
    url: "https://github.com/stoplightio/spectral-owasp-ruleset/blob/main/src/ruleset.ts#L436",
    description:
      "Define proper rate limiting to avoid attackers overloading the API. There are many ways to implement rate-limiting, but most of them involve using HTTP headers, and there are two popular ways to do that:\n\nIETF Draft HTTP RateLimit Headers:. https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/\n\nCustomer headers like X-Rate-Limit-Limit (Twitter: https://developer.twitter.com/en/docs/twitter-api/rate-limits) or X-RateLimit-Limit (GitHub: https://docs.github.com/en/rest/overview/resources-in-the-rest-api)",
  },
  "owasp:api4:2019-rate-limit-retry-after": {
    url: "https://github.com/stoplightio/spectral-owasp-ruleset/blob/main/src/ruleset.ts#L468",
    description:
      "Define proper rate limiting to avoid attackers overloading the API. Part of that involves setting a Retry-After header so well meaning consumers are not polling and potentially exacerbating problems.",
  },
  "owasp:api4:2019-rate-limit-responses-429": {
    url: "https://github.com/stoplightio/spectral-owasp-ruleset/blob/main/src/ruleset.ts#L484",
    description:
      "OWASP API Security recommends defining schemas for all responses, even errors. A HTTP 429 response signals the API client is making too many requests, and will supply information about when to retry so that the client can back off calmly without everything breaking. Defining this response is important not just for documentation, but to empower contract testing to make sure the proper JSON structure is being returned instead of leaking implementation details in backtraces. It also ensures your API/framework/gateway actually has rate limiting set up.",
  },
  "owasp:api7:2019-security-hosts-https-oas3": {
    url: "https://github.com/stoplightio/spectral-owasp-ruleset/blob/main/src/ruleset.ts#L767",
    description:
      "All server interactions MUST use the https protocol, meaning server URLs should begin `https://`.\n\nLearn more about the importance of TLS (over SSL) here: https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html",
  },
  "redocly-operation-summary": {
    url: "https://redocly.com/docs/cli/rules/operation-summary/",
    description:
      "Operation summaries are used to generate API docs. Redocly uses the summary as the header for the operation, as well as the sidebar navigation text.",
  },
  "redocly-components-invalid-map-name": {
    url: "https://redocly.com/docs/cli/rules/spec-components-invalid-map-name/",
    description:
      "All components MUST use keys that match the regular expression: ^[a-zA-Z0-9.-_]+$",
  },
  "redocly-no-server-variables-empty-enum": {
    url: "https://redocly.com/docs/cli/rules/no-server-variables-empty-enum/",
    description:
      "If you use server variables, there are generally two kinds: tenant-driven and environment-driven. In the case of environment-driven variables, you may want to predefine all of the possible values.",
  },
  "redocly-no-undefined-server-variable": {
    url: "https://redocly.com/docs/cli/rules/no-undefined-server-variable/",
    description:
      "Document all declared server variables to make it easier to consume the API.",
  },
  "oas3-example-external-check": {
    url: getVacuumIssueUrl("examples", "oas3-example-external-check"),
    violationExplanation:
      "Examples can have an externalValue or a value, but they cannot have both.",
    description:
      "When defining an OpenAPI specification, it's critical that every operation request and response have examples defined for them. The same applies to definitions defined as references. Examples help consumers of your API understand what real data should actually look like when sending requests, or listening for responses.",
  },
  "oas3-missing-example": {
    url: getVacuumIssueUrl("examples", "oas3-missing-example"),
    violationExplanation:
      "The specification is missing examples in one or more areas.",
    description:
      "When defining an OpenAPI specification, it's critical that every operation request and response have examples defined for them. The same applies to definitions defined as references. Examples help consumers of your API understand what real data should actually look like when sending requests, or listening for responses.",
  },
  "oas3-valid-schema-example": {
    violationExplanation:
      "The specification has examples that do not match the schema defined.",
    description:
      "When defining an OpenAPI specification, it's critical that every operation request and response have examples defined for them. The same applies to definitions defined as references. Examples help consumers of your API understand what real data should actually look like when sending requests, or listening for responses.",
    url: getVacuumIssueUrl("examples", "oas3-valid-schema-example"),
  },
  "no-http-verbs-in-path": {
    url: getVacuumIssueUrl("operations", "no-http-verbs-in-path"),
    description:
      "When HTTP verbs (get/post/put etc.) are used in path segments, it muddies the semantics of REST and creates a confusing and inconsistent experience.",
    violationExplanation:
      "An HTTP verb appeared as part of a segment of a path.",
  },
  "no-ambiguous-paths": {
    url: getVacuumIssueUrl("operations", "no-ambiguous-paths"),
    description:
      "Every path in an OpenAPI specification, should be unambiguous and clearly resolvable. What this essentially means is that each path should be able to be resolved independently when using variables in path segments. For example ‘/burgers/{burgerId}’ and ‘/{foodType}/burgers’ are ambiguous, they can’t be resolved and either could trigger a different operation.",
    violationExplanation:
      "Ambiguous paths were detected, paths that can't be used together in the same specification.",
  },
  "operation-4xx-response": {
    description:
      "Consumers of your API are always going to send bad data. Unless operations return at least one User Error status code (4xx), the consumer of the API has no idea if they are using it correctly.",
    violationExplanation:
      "There is an Operation Response in your specification that isn’t returning at least one 4xx error code.",
    url: getVacuumIssueUrl("operations", "operation-4xx-response"),
  },
  "path-declarations-must-exist": {
    url: getVacuumIssueUrl("operations", "path-declarations-must-exist"),
    description:
      "When defining Paths and using Path Parameters It’s important to not add blank declarations.",
    violationExplanation:
      "One or more paths definitions has an empty parameter defined.",
  },
  "path-keys-no-trailing-slash": {
    url: getVacuumIssueUrl("operations", "path-keys-no-trailing-slash"),
    description:
      "It’s good hygiene to keep trailing slashes off paths, mainly because it can confuse tooling that use the specification for generating code, mocking or other applications. Some tools will get confused, some tools won’t care.",
    violationExplanation:
      "One or more paths definitions contains a trailing slash.",
  },
  "path-not-include-query": {
    url: getVacuumIssueUrl("operations", "path-not-include-query"),
    description:
      "Path segments should not include query parameters. Query parameters are not part of the path, they are part of the query string.",
    violationExplanation:
      "One or more paths definitions contains a query parameter.",
  },
  "operation-operationId-valid-in-url": {
    url: getVacuumIssueUrl("operations", "operation-operationId-valid-in-url"),
    description:
      "Operation IDs are used to generate SDKs and documentation. They should be valid in URLs.",
    violationExplanation:
      "The operationId for one or more Operation definitions is not URL friendly.",
  },
  "operation-success-response": {
    url: getVacuumIssueUrl("operations", "operation-success-response"),
    description:
      "An operation isn’t much use, unless it returns an OK status code (2xx), or a Redirect/Choice status code (3xx)",
    violationExplanation:
      "One or more operations does not have a 2XX or 3XX response defined.",
  },
  "operation-operationId": {
    url: getVacuumIssueUrl("operations", "operation-operationId"),
    description:
      "Every operation must have an operationId. It’s critical that all Operation’s have an identifier. An operationId is used by documentation tools, code generators and mocking engines. It’s used to define page names, URI’s and method names in auto-generated code.",
    violationExplanation: "One or more operations is missing an OperationId.",
  },
  "operation-operationId-unique": {
    url: getVacuumIssueUrl("operations", "operation-operationId-unique"),
    description:
      "Every operation must have a unique operationId. It’s critical that all Operation’s have a unique identifier. An operationId is used by documentation tools, code generators and mocking engines. It’s used to define page names, URI’s and method names in auto-generated code.",
    violationExplanation:
      "One or more operations has a non-unique OperationId.",
  },
  "operation-parameters": {
    url: getVacuumIssueUrl("operations", "operation-parameters"),
    description:
      "Operation Parameters can be described through paths, headers cookies and queries. It’s important to ensure that none of these parameters are duplicates, which is easier that you may think, when an operation has multiple parameter definitions across different types.",
    violationExplanation:
      "There is a Parameter in the specification that has been duplicated or it’s using multiple input types",
  },
  "path-params": {
    url: getVacuumIssueUrl("operations", "path-params"),
    description:
      "Path Parameters are pretty easy to get wrong. Sometimes, they can be defined, but never used, or used but never defined. Sometimes they are duplicated, or set to required, but then are not defined.",
    violationExplanation:
      "An operation has used path parameters, but has incorrectly implemented them.",
  },
  "oas-schema-check": {
    url: getVacuumIssueUrl("schemas", "oas-schema-check"),
    description:
      "This checks that all schemas have a valid type, and perform basic type validation on the schema based on the JSON Schema specification.",
    violationExplanation:
      "The property either has an invalid type or violates constraints in the JSON schema.",
  },
  "duplicated-entry-in-enum": {
    url: getVacuumIssueUrl("schemas", "duplicated-entry-in-enum"),
    description:
      "Enums are a list of unique values. If the same value is listed twice, it’s likely a mistake.",
    violationExplanation:
      "A value listed in an enum has been duplicated. Each value needs to be unique.",
  },
  "oas3-schema": {
    url: getVacuumIssueUrl("schemas", "oas3-schema"),
    description:
      "This rule ensures that the document provided, matches the schema of an OpenAPI 3.0+ document or OpenAPI 3.1.",
    violationExplanation:
      "The spec provided is not a valid OpenAPI 3 or OpenAPI 3.1 specification.",
  },
  "oas3-unused-component": {
    url: getVacuumIssueUrl("schemas", "oas3-unused-component"),
    description:
      "This rule ensures that all components defined in the components section are used in the specification.",
    violationExplanation:
      "A component has been created, but it’s not actually used/referenced by anything else in the specification.",
  },
  "typed-enum": {
    url: getVacuumIssueUrl("schemas", "typed-enum"),
    description: "Enum definitions should match specified types.",
    violationExplanation:
      "One or more enum values do not match the specified type.",
  },
  "oas3-host-trailing-slash": {
    url: getVacuumIssueUrl("information", "oas3-host-trailing-slash"),
    description:
      "The url value cannot end with a trailing slash. The addition of a slash will create invalid URI’s when consumed by tools.",
    violationExplanation:
      "‘/’ was found at the end of the url property of the specification.",
  },
  "oas3-host-not-example": {
    url: getVacuumIssueUrl("information", "oas3-host-not-example"),
    description:
      "Sometimes a Server definition url contains ‘example.com’, added during testing phases. Sometimes this is left in when the specification is pushed to production.",
    violationExplanation:
      "‘example.com’ was found in the url property of a Server definition.",
  },
  "contact-properties": {
    url: getVacuumIssueUrl("information", "contact-properties"),
    description:
      "Anyone publishing an OpenAPI contract, should include details of who they are, and how to contact them.",
    violationExplanation:
      "One of more contact details are missing from the contract.",
  },
  "info-contact": {
    url: getVacuumIssueUrl("information", "info-contact"),
    description:
      "This rule checks that the contact object has been set on the Information Object",
    violationExplanation:
      "There is no contact object set in the info object. The info object may also be missing.",
  },
  "info-description": {
    url: getVacuumIssueUrl("information", "info-description"),
    description:
      "The Info Object should always have a description defined. Think about the kind of questions that someone consuming the contract would want to know.",
    violationExplanation:
      "There is no description defined in the info object. The info object may also be missing entirely.",
  },
  "info-license": {
    url: getVacuumIssueUrl("information", "info-license"),
    description: "The Info Object should always have a license defined.",
    violationExplanation:
      "There is no license defined in the info object. The info object may also be missing entirely.",
  },
  "license-url": {
    url: getVacuumIssueUrl("information", "license-url"),
    description:
      "The license object should always have a URL defined. This is important for consumers of the contract to understand the licensing terms.",
    violationExplanation:
      "There is no URL defined in the license object. The license object may also be missing entirely.",
  },
  "oas3-api-servers": {
    url: getVacuumIssueUrl("validation", "oas3-api-servers"),
    description:
      "When configuring Servers in OpenAPI, its important to ensure correctness, so tooling can inspect endpoints automatically. Mis-configured server configurations will damage automation capabilities for the contract.",
    violationExplanation:
      "The servers object is missing from the spec, or one of more entries contain an invalid URL.",
  },
  "no-eval-in-markdown": {
    url: getVacuumIssueUrl("validation", "no-eval-in-markdown"),
    description:
      "Some tools use JavaScript to render OpenAPI docs. They can be vulnerable to XSS attacks if they render HTML/markdown from descriptions that contain malicious eval() calls.",
    violationExplanation:
      "There is JavaScript code using eval() defined in a description value.",
  },
  "no-script-tags-in-markdown": {
    url: getVacuumIssueUrl("validation", "no-script-tags-in-markdown"),
    description:
      "Some tools use JavaScript to render OpenAPI docs. They can be vulnerable to XSS attacks if they render HTML/markdown from descriptions that contain malicious <script> code.",
    violationExplanation:
      "There is JavaScript code being injected via a <script> tag defined in a description value.",
  },
  "component-description": {
    url: getVacuumIssueUrl("descriptions", "component-description"),
    description:
      "It’s important to describe components, so that consumers of the contract understand what they are for.",
    violationExplanation: "One or more components are missing a description.",
  },
  "oas3-parameter-description": {
    url: getVacuumIssueUrl("descriptions", "oas3-parameter-description"),
    description:
      "It’s important to describe parameters, so that consumers of the contract understand what they are for.",
    violationExplanation: "One or more parameters are missing a description.",
  },
  "operation-description": {
    url: getVacuumIssueUrl("descriptions", "operation-description"),
    description:
      "It’s important to describe operations, so that consumers of the contract understand what they are for.",
    violationExplanation: "One or more operations are missing a description.",
  },
  "tag-description": {
    url: getVacuumIssueUrl("tags", "tag-description"),
    description:
      "Tags are used as navigation/taxonomy meta-data for documentation and code generation tooling. Descriptions are really important for consumers.",
    violationExplanation:
      "One or more global tags does not contain a description.",
  },
  "operation-tags": {
    url: getVacuumIssueUrl("tags", "operation-tags"),
    description:
      "Operations make use of Tags to group operations together. Tags are really important for documentation and exploring tools. This rule checks that an operation has defined tags, and that at least one exists",
    violationExplanation:
      "One or more operation in the specification does not have a tags property that contains at least a single tag.",
  },
  "openapi-tags": {
    url: getVacuumIssueUrl("tags", "openapi-tags"),
    description:
      "Tags are used as navigation/taxonomy meta-data for documentation and code generation tooling.",
    violationExplanation:
      "Global tags have not been defined, or they are not an array as required by the schema.",
  },
  "operation-tag-defined": {
    url: getVacuumIssueUrl("tags", "operation-tag-defined"),
    description:
      "Operation Tags are used to define operation categories or groups. Sometimes, tags that have been defined for an operation, have not been defined as part of the global scope of the specification.",
    violationExplanation:
      "A tag was used in an operation, without that tag being defined in the global scope.",
  },
  "oas3-operation-security-defined": {
    url: getVacuumIssueUrl("security", "oas3-operation-security-defined"),
    description:
      "It’s important to add the correct [Authentication and Authorization] information in a specification. It’s easy to forget to add security to an operation, or use a scheme that isn’t globally defined. This rule will check the security values of an operation, checking they reference a valid scheme.",
    violationExplanation:
      "A security definition has been used that is not defined as a part of $components.securitySchemes.",
  },
  "owasp-security-hosts-https-oas3": {
    url: getVacuumIssueUrl("owasp", "owasp-security-hosts-https-oas3"),
    description:
      "All server interactions MUST use the https protocol, meaning server URLs should begin `https://`.",
  },
  "owasp-constrained-additionalProperties": {
    url: getVacuumIssueUrl("owasp", "owasp-constrained-additionalProperties"),
    description:
      "By default, JSON Schema allows additional properties, which can potentially lead to mass assignment issues with OpenAPI. Avoid using additionalProperties in schemas. Use maxProperties instead.",
  },
  "owasp-integer-format": {
    url: getVacuumIssueUrl("owasp", "owasp-integer-format"),
    description:
      "Schema of type integer must specify format of int32 or int64.",
  },
  "owasp-integer-limit": {
    url: getVacuumIssueUrl("owasp", "owasp-integer-limit"),
    description:
      "Integers should be limited to mitigate resource exhaustion attacks. Ensure that minimum and maximum or exclusiveMinimum and exclusiveMaximum have been specified. (or a combination of them)",
  },
  "owasp-string-restricted": {
    url: getVacuumIssueUrl("owasp", "owasp-string-restricted"),
    description:
      "To avoid unexpected values being sent or leaked, ensure that strings have either a format, RegEx pattern, enum, or `const",
  },
  "owasp-string-limit": {
    url: getVacuumIssueUrl("owasp", "owasp-string-limit"),
    description:
      "String size should be limited to mitigate resource exhaustion attacks. This can be done using maxLength, enum or const.",
  },
  "owasp-array-limit": {
    url: getVacuumIssueUrl("owasp", "owasp-array-limit"),
    description:
      "Array size should be limited to mitigate resource exhaustion attacks. Ensure that maxItems has been specified.",
  },
  "owasp-define-error-responses-429": {
    url: getVacuumIssueUrl("owasp", "owasp-define-error-responses-429"),
    description:
      "OWASP API Security recommends defining schemas for all responses. This includes the 429 response error code.",
  },
  "owasp-rate-limit-retry-after": {
    url: getVacuumIssueUrl("owasp", "owasp-rate-limit-retry-after"),
    description:
      "Define proper rate limiting to avoid attackers overloading the API. Part of that involves setting a Retry-After header so well meaning consumers are not polling and potentially exacerbating problems.",
  },
  "owasp-rate-limit": {
    url: getVacuumIssueUrl("owasp", "owasp-rate-limit"),
    description:
      "Define proper rate limiting to avoid attackers overloading the API. There are many ways to implement rate-limiting, but most of them involve using HTTP headers, and there are two popular ways to do that:\n\nIETF Draft HTTP RateLimit Headers:. https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/\n\nCustomer headers like X-Rate-Limit-Limit (Twitter: https://developer.twitter.com/en/docs/twitter-api/rate-limits) or X-RateLimit-Limit (GitHub: https://docs.github.com/en/rest/overview/resources-in-the-rest-api)",
  },
  "owasp-define-error-responses-500": {
    url: getVacuumIssueUrl("owasp", "owasp-define-error-responses-500"),
    description:
      "OWASP API Security recommends defining schemas for all responses. This includes the 500 response error code.",
  },
  "owasp-define-error-responses-401": {
    url: getVacuumIssueUrl("owasp", "owasp-define-error-responses-401"),
    description:
      "OWASP API Security recommends defining schemas for all responses. This includes the 401 response error code.",
  },
  "owasp-define-error-validation": {
    url: getVacuumIssueUrl("owasp", "owasp-define-error-validation"),
    description:
      "Check that an error response of either 400, 422 or 4XX has been defined.Carefully define schemas for all the API responses, including either 400, 422 or 4XX responses which describe errors caused by invalid request",
  },
  "owasp-protection-global-safe": {
    url: getVacuumIssueUrl("owasp", "owasp-protection-global-safe"),
    description:
      "Check if the operation is protected at operation level. Otherwise, check the global #/security property",
  },
  "owasp-jwt-best-practices": {
    url: getVacuumIssueUrl("owasp", "owasp-jwt-best-practices"),
    description:
      "Security schemes using JWTs must explicitly declare support for RFC8725 in the description.",
  },
  "owasp-auth-insecure-schemes": {
    url: getVacuumIssueUrl("owasp", "owasp-auth-insecure-schemes"),
    description:
      "There are many HTTP authorization schemes but some of them are now considered insecure, such as negotiating authentication using specifications like NTLM or OAuth v1.",
  },
  "owasp-no-credentials-in-url": {
    url: getVacuumIssueUrl("owasp", "owasp-no-credentials-in-url"),
    description:
      "Credentials should not be included in the URL. This is a security risk.",
  },
  "owasp-no-api-keys-in-url": {
    url: getVacuumIssueUrl("owasp", "owasp-no-api-keys-in-url"),
    description:
      "API keys should not be included in the URL. This is a security risk.",
  },
  "owasp-no-http-basic": {
    url: getVacuumIssueUrl("owasp", "owasp-no-http-basic"),
    description:
      "Basic authentication credentials transported over network are more susceptible to interception than other forms of authentication, and as they are not encrypted it means passwords and tokens are more easily leaked.",
  },
  "owasp-no-numeric-ids": {
    url: getVacuumIssueUrl("owasp", "owasp-no-numeric-ids"),
    description: "Use random IDs that cannot be guessed. UUIDs are preferred.",
  },
};

export const getRuleData = (ruleCode: string | number) => {
  return RULE_DESCRIPTIONS[ruleCode];
};
