import { assert } from "chai";
import validateOpenapi from "./validate-openapi.js";

describe("Validate OpenAPI", function () {
  it("Validates file", async function () {
    const result = validateOpenapi(
      `{
        "openapi": "3.0.0",
        "info": {
          "title": "The Zuplo Developer API, powered by Zuplo",
          "version": "1.0.0",
          "description": "Welcome to ZAPI",
          "termsOfService": "https://zuplo.com/legal/terms",
          "contact": {
            "name": "Zuplo",
            "url": "https://zuplo.com/",
            "email": "support@zuplo.com"
          }
        }
      }`,
    );
    assert.isTrue(result);
  });
});
