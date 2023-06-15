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
scores and performance to expect.

### Vacuum with Default Rules

| Example Spec    | Linter processing time (ms) | Overall Processing Time (ms) | Score |
| --------------- | --------------------------- | ---------------------------- | ----- |
| Twilio (29KB)   | ~60                         | ~70                          | 50    |
| Asana (589KB)   | ~180                        | ~200                         | 93    |
| petstore (26KB) | ~60                         | ~70                          | 80    |
| Box (1.4MB)     | ~300                        | ~320                         | 91    |

### Spectral with Default Rules

| Example Spec    | Linter processing time (ms) | Overall Processing Time (ms) | Score |
| --------------- | --------------------------- | ---------------------------- | ----- |
| Twilio (29KB)   | ~110                        | ~220                         | 93    |
| Asana (589KB)   | ~1400                       | ~1600                        | 100   |
| petstore (26KB) | ~150                        | ~260                         | 89    |
| Box (1.4MB)     | ~2660                       | ~2860                        | 100   |
