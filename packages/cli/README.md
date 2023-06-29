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
| petstore (26KB) | ~60                         | ~70                          | 86    |
| OpenAI (143KB)  | ~72                         | ~85                          | 67    |
| Asana (589KB)   | ~170                        | ~200                         | 95    |
| Box (1.4MB)     | ~300                        | ~320                         | 93    |

### Spectral

The spectral ruleset is tuned to closely match the rules in Vacuum, but some
rules do not exist in Spectral - resulting in variance in scores.

| Example Spec    | Linter processing time (ms) | Overall Processing Time (ms) | Score |
| --------------- | --------------------------- | ---------------------------- | ----- |
| petstore (26KB) | ~150                        | ~260                         | 92    |
| OpenAI (143KB)  | ~160                        | ~290                         | 75    |
| Asana (589KB)   | ~1400                       | ~1550                        | 100   |
| Box (1.4MB)     | ~2660                       | ~2860                        | 100   |
