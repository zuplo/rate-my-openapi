# Rate My OpenAPI CLI

<p align="center">
  <a href="https://ratemyopenapi.com/">
    <img src="https://github.com/zuplo/rate-my-openapi/blob/main/assets/gh-header.png" height="96">
    <h3 align="center">Rate My Open API</h3>
  </a>
</p>

This CLI project aims to give a rating to OpenAPI definitions so you can
understand how helpful they are for the OpenAPI lifecycle. Having a low score
might mean that your journey of governing your API is going to be harder than it
should.

## Installation

```bash
npm install -g rmoa
```

## Usage

You can use the CLI to lint & get a score for your OpenAPI definition. You'll
need to create your api key on the
[Rate My Open API Portal](https://api.ratemyopenapi.com/docs) to use the CLI.

To start using the CLI, run:

```bash
rmoa --help
```

### Commands

```
rmoa <command>

Commands:
rmoa lint

Lint & get a score for your OpenAPI definition using the Rate My OpenAPI ruleset

Options:
  --version        Show version number                                 [boolean]
  --help           Show help                                           [boolean]
  --api-key        Your Rate My OpenAPI API Key              [string] [required]
  --filename       The OpenApi file name to process          [string] [required]
  --dir            The directory containing your Open API file
                                                         [string] [default: "."]
  --output         default, json                   [string] [default: "default"]
  --max-warnings   The maximum number of warnings allowed before labeling the ru
                   n as failed. Default is 5.              [number] [default: 5]
  --max-errors     The maximum number of errors allowed before labeling the run
                   as failed. Default is 0.                [number] [default: 0]
  --minimum-score  The minimum score (0 - 100) to label a lint run as successful
                   /passing. Default is 80.               [number] [default: 80]
```
