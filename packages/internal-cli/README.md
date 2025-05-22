# rate-my-openapi-cli

## Installation

1. Build the Internal CLI

**From the root of the project** run:

```
npm install

npm run build
```

2. Run the CLI

```
cd packages/internal-cli

node rate-my-openapi.js generate-rating --filepath example-specs/zuplo.json
```

### Commands

| Command                  | Description                                                                                                          | Example                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| generate-rating          | Generates a rating report for an OpenAPI file, outputting scores for the overall file, each path, and each operation | `rate-my-openapi generate-rating --filepath example-specs/twilio-pricing.json`          |
| generate-rating-spectral | Same as above but using Spectral instead of Vacuum                                                                   | `rate-my-openapi generate-rating-spectral --filepath example-specs/twilio-pricing.json` |

## Examples

The `example-specs` folder contains some sample OpenAPI files to get an idea of
scores and performance to expect. Tests were run on an M1 Macbook Pro.

### Vacuum

| Example Spec    | Linter processing time (ms) | Overall Processing Time (ms) | Score |
| --------------- | --------------------------- | ---------------------------- | ----- |
| petstore (26KB) | TBD                         | TBD                          | 85    |
| OpenAI (143KB)  | TBD                         | TBD                          | 67    |
| Asana (589KB)   | TBD                         | TBD                          | 96    |
| Box (1.4MB)     | TBD                         | TBD                          | 96    |

### Spectral

The spectral ruleset is tuned to closely match the rules in Vacuum, but some
rules do not exist in Spectral - resulting in variance in scores.

| Example Spec    | Linter processing time (ms) | Overall Processing Time (ms) | Score |
| --------------- | --------------------------- | ---------------------------- | ----- |
| petstore (26KB) | TBD                         | TBD                          | 89    |
| OpenAI (143KB)  | TBD                         | TBD                          | 74    |
| Asana (589KB)   | TBD                         | TBD                          | 99    |
| Box (1.4MB)     | TBD                         | TBD                          | 100   |
