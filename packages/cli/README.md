# rate-my-openapi-cli

## Installation

1. Install [Vacuum](https://quobix.com/vacuum/)

```
npm install -g @quobix/vacuum
```

2. Install this CLI

```
npm install -g .
```

## Usage

Invoke via `rate-my-openapi`.

### Commands

| Command         | Description                                                                                                          | Example                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| generate-rating | Generates a rating report for an OpenAPI file, outputting scores for the overall file, each path, and each operation | `rate-my-openapi generate-rating --filepath example-specs/twilio-pricing.json` |

## Examples

The `example-specs` folder contains some sample OpenAPI files to get an idea of
scores and performance to expect. Tests were run on an M1 Macbook Pro.

### Vacuum

| Example Spec    | Linter processing time (ms) | Overall Processing Time (ms) | Score |
| --------------- | --------------------------- | ---------------------------- | ----- |
| petstore (26KB) | ~60                         | ~70                          | 85    |
| OpenAI (143KB)  | ~72                         | ~85                          | 67    |
| Asana (589KB)   | ~170                        | ~200                         | 96    |
| Box (1.4MB)     | ~300                        | ~320                         | 96    |

### Spectral

The spectral ruleset is tuned to closely match the rules in Vacuum, but some
rules do not exist in Spectral - resulting in variance in scores.

| Example Spec    | Linter processing time (ms) | Overall Processing Time (ms) | Score |
| --------------- | --------------------------- | ---------------------------- | ----- |
| petstore (26KB) | ~150                        | ~260                         | 89    |
| OpenAI (143KB)  | ~160                        | ~290                         | 74    |
| Asana (589KB)   | ~1400                       | ~1550                        | 99    |
| Box (1.4MB)     | ~2660                       | ~2860                        | 100   |

Categories:

- Overall Score
  - See the vacuum ruleset
- Quality for docs
  - Examples
  - OperationID
  - Document 2XX
  - Document 4XX
  - Tags (with descriptions)
  - Servers list
  - Descriptions
- SDK generation
  - No empty servers list
  - No inline schema definitions
  - Include title, names, descriptions, and summaries
  - No missing examples
  - OperationID is required
  - Include 2XX response
  - Optional params come last
  - Reuse components
- Completeness
  - Examples
  - Document 2XX
  - Document 4XX
  - Servers list
  - Descriptions
  - All Info properties
- Security
  - Security defined See
    https://github.com/stoplightio/spectral-owasp-ruleset/blob/main/src/ruleset.ts
  - owasp:api1:2019-no-numeric-ids
  - owasp:api3:2019-define-error-validation
  - owasp:api3:2019-define-error-responses-401
  - owasp:api3:2019-define-error-responses-500
  - owasp:api4:2019-rate-limit
  - owasp:api4:2019-rate-limit-retry-after
  - owasp:api4:2019-rate-limit-responses-429
  - owasp:api7:2019-security-hosts-https-oas3
