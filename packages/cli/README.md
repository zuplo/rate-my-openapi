# Rate My OpenAPI CLI

<p align="center">
  <a href="https://ratemyopenapi.com/">
    <img src="https://github.com/zuplo/rate-my-openapi/blob/main/assets/gh-header.png" height="96">
    <h3 align="center">Rate My Open API</h3>
  </a>
</p>

This CLI project aims to give a rating to OpenAPI definitions so you can understand
how helpful they are for the OpenAPI lifecycle. Having a low score might mean
that your journey of governing your API is going to be harder than it should.

# RMOA CLI

```
rmoa <command>

Commands:
rmoa lint

Uploads an Open API file & gets it's Rate My Open API results

Options:
  --version   Show version number                                      [boolean]
  --help      Show help                                                [boolean]
  --api-key   The API Key from Zuplo                         [string] [required]
  --filename  The OpenApi file name to process               [string] [required]
  --dir       The directory containing your Open API file[string] [default: "."]
  --output    default, json                        [string] [default: "default"]
```

## Using the CLI

You can also use the CLI to lint & get a score for your OpenAPI definition.
Create your api key on the [Rate My Open API Portal](https://api.ratemyopenapi.com/docs)

```
npx rmoa lint --dir /path/to/your/ --filename openapi.json --api-key zpka_1b...
```

