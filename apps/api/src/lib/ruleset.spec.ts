import spectralCore from "@stoplight/spectral-core";
import SpectralParsers from "@stoplight/spectral-parsers";
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import { assert } from "chai";
import * as fs from "node:fs";
import { join } from "node:path";

const { Spectral, Document } = spectralCore;

const RULE_401 = "owasp:api3:2019-define-error-responses-401";

async function lint401(spec: object) {
  const spectral = new Spectral();
  spectral.setRuleset(
    await bundleAndLoadRuleset(join(process.cwd(), "rulesets/.spectral.yaml"), {
      fs,
      fetch,
    }),
  );
  const results = await spectral.run(
    new Document(JSON.stringify(spec), SpectralParsers.Json),
  );
  return results
    .filter((result) => result.code === RULE_401)
    .map((result) => result.path.slice(0, 3).join(" "));
}

const okResponse = {
  description: "OK",
  content: { "application/json": { schema: { type: "object" } } },
};

describe("Spectral ruleset", function () {
  // https://github.com/zuplo/rate-my-openapi/issues/293
  it("does not require a 401 response on operations with security: []", async function () {
    const paths = await lint401({
      openapi: "3.0.3",
      info: { title: "Test", version: "1.0.0" },
      components: {
        securitySchemes: {
          bearer: { type: "http", scheme: "bearer" },
        },
      },
      security: [{ bearer: [] }],
      paths: {
        "/.well-known/openid-configuration": {
          get: {
            security: [],
            responses: { "200": okResponse },
          },
        },
        "/private": {
          get: {
            responses: { "200": okResponse },
          },
          post: {
            security: [{ bearer: [] }],
            responses: { "200": okResponse },
          },
        },
      },
    });
    assert.sameMembers(paths, [
      "paths /private get",
      "paths /private get",
      "paths /private post",
      "paths /private post",
    ]);
  });
});
