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
