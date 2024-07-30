# Rate My OpenAPI CLI

<p align="center">
  <a href="https://ratemyopenapi.com/">
    <img src="https://cdn.zuplo.com/static/logos/logo.svg" height="70">
  </a>
</p>

At Zuplo we believe that the better the quality of an OpenAPI document, the
better the developer experience will be for the consumers of that API. This
experience is important for the success of an API.

Rate My OpenAPI is a suite of tools designed to help software developers using
OpenAPI to meet high standards of quality and usability when designing and
developing their APIs.

The CLI tool is perfect for developers who prefer working from the command line
or need to integrate quality checks into their development workflow. It provides
the same lint results as the website with the added benefit of it being easier
to integrate into your development workflow

## Installation

```bash
npm install -g rmoa
```

## Usage

You can use the CLI to lint & get a score for your OpenAPI definition in a
format that's easier to parse and integrate with your development workflow.

### Getting an API Key

You will need an API key as the CLI uses the Rate My OpenAPI APIs which require
the use of an API Key. You can sign up for free at
[https://api.ratemyopenapi.com/docs](https://api.ratemyopenapi.com/docs) to get
your API Key.

### Basic

Lint an OpenAPI definition, json or yaml format, using the CLI's default
configuration by running:

```bash
rmoa lint --filename <openapi-filename> --api-key <API_KEY>
```

### Advanced

Lint an OpenAPI definition using the CLI's and override the minimum passing
score (default is 80 out of 100), set the maximum number of allowed warnings &
errors and get the output in json format.

```bash
rmoa lint --filename <openapi-filename> --api-key <API_KEY> --minimum-score 60
```

### Commands

```bash
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
                   n as failed.                                         [number]
  --max-errors     The maximum number of errors allowed before labeling the run
                   as failed.                                           [number]
  --minimum-score  The minimum score (0 - 100) to label a lint run as successful
                   /passing. Default is 80.               [number] [default: 80]
```
