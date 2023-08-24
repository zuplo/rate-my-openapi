const RULE_DESCRIPTIONS: Record<
  string,
  { description: string } | { urlPathFragment: string }
> = {
  "apimatic-security-defined": {
    description:
      "Apimatic: It is recommended to define at least one authentication scheme globally using the securitySchemes property in the components section and use it globally to authenticate all the endpoints or use it for specific endpoints.",
  },
  "apimatic-operationId-max-length": {
    description:
      "Apimatic: Longer content can lead to issues in the code generation process. It's best to keep the length to a maximum of 50 characters, wherever possible.",
  },
  "apimatic-parameter-name-max-length": {
    description:
      "Apimatic: Longer content can lead to issues in the code generation process. It's best to keep the length to a maximum of 50 characters, wherever possible.",
  },
  "apimatic-header-name-max-length": {
    description:
      "Apimatic: Longer content can lead to issues in the code generation process. It's best to keep the length to a maximum of 50 characters, wherever possible.",
  },
  "apimatic-component-name-max-length": {
    description:
      "Apimatic: Longer content can lead to issues in the code generation process. It's best to keep the length to a maximum of 50 characters, wherever possible.",
  },
  "apimatic-no-inline-response-schema": {
    description:
      "Apimatic: In general, inline schemas are not encouraged in code generators and API portal generators since their names are inferred from the parent node in which they are defined inline.",
  },
  "apimatic-no-inline-parameter-schema": {
    description:
      "Apimatic: In general, inline schemas are not encouraged in code generators and API portal generators since their names are inferred from the parent node in which they are defined inline.",
  },
  "apimatic-no-inline-request-body-schema": {
    description:
      "Apimatic: In general, inline schemas are not encouraged in code generators and API portal generators since their names are inferred from the parent node in which they are defined inline.",
  },
  "owasp:api1:2019-no-numeric-ids": {
    description:
      "OWASP API1:2019 - Use random IDs that cannot be guessed. UUIDs are preferred.",
  },
  "owasp:api2:2019-no-http-basic": {
    description:
      "Basic authentication credentials transported over network are more susceptible to interception than other forms of authentication, and as they are not encrypted it means passwords and tokens are more easily leaked.",
  },
  "owasp:api3:2019-define-error-responses-401": {
    description:
      "OWASP API Security recommends defining schemas for all responses, even errors. The 401 describes what happens when a request is unauthorized, so its important to define this not just for documentation, but to empower contract testing to make sure the proper JSON structure is being returned instead of leaking implementation details in backtraces.",
  },
  "owasp:api3:2019-define-error-responses-500": {
    description:
      "OWASP API Security recommends defining schemas for all responses, even errors. The 500 describes what happens when a request fails with an internal server error, so its important to define this not just for documentation, but to empower contract testing to make sure the proper JSON structure is being returned instead of leaking implementation details in backtraces.",
  },
  "owasp:api4:2019-rate-limit": {
    description:
      "Define proper rate limiting to avoid attackers overloading the API. There are many ways to implement rate-limiting, but most of them involve using HTTP headers, and there are two popular ways to do that:\n\nIETF Draft HTTP RateLimit Headers:. https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/\n\nCustomer headers like X-Rate-Limit-Limit (Twitter: https://developer.twitter.com/en/docs/twitter-api/rate-limits) or X-RateLimit-Limit (GitHub: https://docs.github.com/en/rest/overview/resources-in-the-rest-api)",
  },
  "owasp:api4:2019-rate-limit-retry-after": {
    description:
      "Define proper rate limiting to avoid attackers overloading the API. Part of that involves setting a Retry-After header so well meaning consumers are not polling and potentially exacerbating problems.",
  },
  "owasp:api4:2019-rate-limit-responses-429": {
    description:
      "OWASP API Security recommends defining schemas for all responses, even errors. A HTTP 429 response signals the API client is making too many requests, and will supply information about when to retry so that the client can back off calmly without everything breaking. Defining this response is important not just for documentation, but to empower contract testing to make sure the proper JSON structure is being returned instead of leaking implementation details in backtraces. It also ensures your API/framework/gateway actually has rate limiting set up.",
  },
  "owasp:api7:2019-security-hosts-https-oas3": {
    description:
      "All server interactions MUST use the https protocol, meaning server URLs should begin `https://`.\n\nLearn more about the importance of TLS (over SSL) here: https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html",
  },
  "redocly-operation-summary": {
    description:
      "Operation summaries are used to generate API docs. Redocly uses the summary as the header for the operation, as well as the sidebar navigation text. See https://redocly.com/docs/cli/rules/operation-summary/",
  },
  "redocly-components-invalid-map-name": {
    description:
      "All components MUST use keys that match the regular expression: ^[a-zA-Z0-9.-_]+$ See https://redocly.com/docs/cli/rules/spec-components-invalid-map-name/",
  },
  "redocly-no-server-variables-empty-enum": {
    description:
      "If you use server variables, there are generally two kinds: tenant-driven and environment-driven. In the case of environment-driven variables, you may want to predefine all of the possible values. See https://redocly.com/docs/cli/rules/no-server-variables-empty-enum/",
  },
  "redocly-no-undefined-server-variable": {
    description:
      "Document all declared server variables to make it easier to consume the API. See https://redocly.com/docs/cli/rules/no-undefined-server-variable/",
  },
  "oas3-valid-schema-example": {
    urlPathFragment: "examples",
  },
  "no-http-verbs-in-path": {
    urlPathFragment: "operations",
  },
  "no-ambiguous-paths": {
    urlPathFragment: "operations",
  },
  "operation-4xx-response": {
    urlPathFragment: "operations",
  },
  "path-declarations-must-exist": {
    urlPathFragment: "operations",
  },
  "path-keys-no-trailing-slash": {
    urlPathFragment: "operations",
  },
  "path-not-include-query": {
    urlPathFragment: "operations",
  },
  "operation-operationId-valid-in-url": {
    urlPathFragment: "operations",
  },
  "operation-success-response": {
    urlPathFragment: "operations",
  },
  "operation-operationId": {
    urlPathFragment: "operations",
  },
  "operation-operationId-unique": {
    urlPathFragment: "operations",
  },
  "operation-parameters": {
    urlPathFragment: "operations",
  },
  "path-params": {
    urlPathFragment: "operations",
  },
  "duplicated-entry-in-enum": {
    urlPathFragment: "schemas",
  },
  "oas3-schema": {
    urlPathFragment: "schemas",
  },
  "oas3-unused-component": {
    urlPathFragment: "schemas",
  },
  "typed-enum": {
    urlPathFragment: "schemas",
  },
  "oas3-host-trailing-slash": {
    urlPathFragment: "information",
  },
  "oas3-host-not-example": {
    urlPathFragment: "information",
  },
  "contact-properties": {
    urlPathFragment: "information",
  },
  "info-contact": {
    urlPathFragment: "information",
  },
  "info-description": {
    urlPathFragment: "information",
  },
  "info-license": {
    urlPathFragment: "information",
  },
  "license-url": {
    urlPathFragment: "information",
  },
  "oas3-api-servers": {
    urlPathFragment: "validation",
  },
  "no-eval-in-markdown": {
    urlPathFragment: "validation",
  },
  "no-script-tags-in-markdown": {
    urlPathFragment: "validation",
  },
  "component-description": {
    urlPathFragment: "descriptions",
  },
  "description-duplication": {
    urlPathFragment: "descriptions",
  },
  "oas3-parameter-description": {
    urlPathFragment: "descriptions",
  },
  "operation-description": {
    urlPathFragment: "descriptions",
  },
  "tag-description": {
    urlPathFragment: "tags",
  },
  "operation-tags": {
    urlPathFragment: "tags",
  },
  "openapi-tags": {
    urlPathFragment: "tags",
  },
  "operation-tag-defined": {
    urlPathFragment: "tags",
  },
  "oas3-operation-security-defined": {
    urlPathFragment: "security",
  },
};

export const getRuleData = (ruleCode: string | number) => {
  return RULE_DESCRIPTIONS[ruleCode];
};
