![Rate My OpenAPI](./assets/gh-header.png)

<div align="center">
<h1>Rate My OpenAPI</h1>
  <a href="https://twitter.com/zuplo">
    <img alt="X (formerly Twitter) Follow" src="https://img.shields.io/twitter/follow/zuplo">
  </a>
  <p align="center">
  <a href="#openapi---introduction
  "><strong>Introduction</strong></a> · 
  <a href="#ratemyopenapicom
  "><strong>Website</strong></a> · 
   <a href="#using-the-cli
  "><strong>CLI</strong></a>
</p>
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

This project aims to give a rating to OpenAPI definitions so you can understand
how helpful they are for the OpenAPI lifecycle. Having a low score might mean
that your journey of governing your API is going to be harder than it should.

## ratemyopenapi.com

https://ratemyopenapi.com is an easy way to upload your OpenAPI definition and
get a score for it. That simple, no strings attached.

## Using the CLI

You can also use the CLI to get a score for your OpenAPI definition.

```
npx @rate-my-openapi/cli generate-rating --filepath /path/to/your/openapi.json
```

This will generate a JSON file with the rating and exact locations of the
offending parts of your OpenAPI definition.

# License

[MIT License](./LICENSE)
