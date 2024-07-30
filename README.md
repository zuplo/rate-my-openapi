<p align="center">
  <a href="https://ratemyopenapi.com/">
    <img src="https://cdn.zuplo.com/static/logos/logo.svg" height="50">
    <h1 align="center">Rate My Open API</h1>
  </a>
</p>

<div align="center">
  <a href="https://twitter.com/zuplo">
    <img alt="X (formerly Twitter) Follow" src="https://img.shields.io/twitter/follow/zuplo">
  </a>
  <p align="center">
    <a href="#openapi---introduction"><strong>Introduction</strong></a> · 
    <a href="#website"><strong>Website</strong></a> · 
    <a href="#cli"><strong>CLI</strong></a> · 
    <a href="#github-action"><strong>GitHub Action</strong></a> · 
    <a href="#apis"><strong>APIs</strong></a>
  </p>
</div>

## OpenAPI - Introduction

[OpenAPI](https://www.openapis.org/) is an industry standard to describe HTTP
APIs. When using OpenAPI in your project, you can leverage other tools to help
you generate documentation, code, tests, mock results, or even deploy your API.
It's what's commonly known as the OpenAPI lifecycle, which looks like this:

<div align="center">
<img style="width:50%" src="assets/openapi-lifecycle-light.png#gh-light-mode-only" />
  <img style="width:50%" src="assets/openapi-lifecycle-dark.png#gh-dark-mode-only" />
</div>

## Rate My Open API

At Zuplo we believe that the better the quality of an OpenAPI document, the
better the developer experience will be for the consumers of that API. This
experience is important for the success of an API.

Rate My OpenAPI is a suite of tools designed to help software developers using
OpenAPI to design and implement their APIs. Our tools include a website, a CLI,
a GitHub Action and an API, all aimed at ensuring your APIs meet high standards
of quality and usability.

### Categories of Evaluation

Our tools evaluate your OpenAPI definition files and provide a comprehensive
score based on four key categories:

- <b>Documentation:</b> Ensure your API is well-documented, making it easy for
  users to understand and use.
- <b>SDK Generation:</b> Verify that your API definition supports SDK
  generation, facilitating integration and usage in different programming
  languages.
- <b>Security:</b> Check for best practices and standards to ensure your API is
  secure and protected against common vulnerabilities.
- <b>Completeness:</b> Ensure your API definition is complete, with all
  necessary endpoints, parameters, and responses accurately defined.

### Website

[https://ratemyopenapi.com](https://ratemyopenapi.com) offers a user-friendly
interface for developers to upload and analyze their OpenAPI definition files.

Key features include:

- <b>Linting:</b> Upload & lint your OpenAPI files to receive detailed feedback.
- <b>Comprehensive Scoring:</b> Get a clear, actionable score rating your API's
  documentation, SDK generation, security, and completeness.
- <b>Detailed Reports:</b> Access in-depth reports that highlight areas of
  improvement and provide recommendations.
- <b>Visualization:</b> Easily visualize the structure and quality of your API
  with in-line feedback.

#### Getting Started

To get started visit [https://ratemyopenapi.com](https://ratemyopenapi.com),
upload your OpenAPI definition file & review the detailed reports to identify
areas for improvement

### CLI

The CLI tool is perfect for developers who prefer working from the command line
or need to integrate quality checks into their development workflow.

Key features include:

- Automated Checks: Integrate the CLI into your CI/CD pipeline for automated
  quality checks on every commit.
- Detailed Output: Get detailed feedback directly in your terminal, with options
  to further integrate these results into your development flow.

#### Getting Started

To get started install the CLI and start integrating it into your development
workflow.

```bash
npm install rmoa

rmoa lint --filename <openapi-filename> --api-key <API_KEY>
```

Source code & documentation at [packages/cli](/packages/cli/README.md)

### GitHub Action

Our GitHub action seamlessly integrates with your repository to ensure your APIs
are consistently of high quality. Key features include:

- <b>Automated Linting:</b> Automatically lint OpenAPI definition files on every
  pull request and push to ensure code quality.
- <b>Inline Feedback:</b> Receive feedback directly in your pull requests with
  comments highlighting issues and areas for improvement.
- <b>Continuous Improvement:</b> Maintain a high standard of API quality with
  continuous monitoring and feedback.

#### Getting Started

To get started add our GitHub action to your repository & configure it to run on
Pull Requests and Pushes to ensure continuous quality monitoring.

```bash
steps:
  - uses: actions/checkout@v4
  - uses: zuplo/rmoa-action@v1
    with:
      filepath: './my-api.json'
      apikey: ${{ secrets.RMOA_API_KEY }}
```

Source code & documentation at
[rmoa-action](https://github.com/zuplo/rmoa-action)

### APIs

All our tools make use of our APIs to analyze and provide detailed results. You
can also make direct use of these APIs, which is a great option for those
developers that want to build their own tools or integrate the Rate My OpenAPI
lint capabilities in a way that's not covered the existing tools.

#### Getting Started

To get started, go to
[https://api.ratemyopenapi.com/docs](https://api.ratemyopenapi.com/docs) to get
the detailed documentation on every endpoint available for use.

# License

[MIT License](./LICENSE)
