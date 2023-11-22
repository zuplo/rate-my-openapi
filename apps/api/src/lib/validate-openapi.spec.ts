import { assert } from "chai";
import validateOpenapi from "./validate-openapi.js";

describe("Validate OpenAPI", function () {
  it("Validates file truthy", async function () {
    const result = validateOpenapi({
      fileContent: `{
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
        }`,
      fileExtension: "json",
    });
    assert.isTrue(result);
  });

  it("Validates file falsy", async function () {
    const result = validateOpenapi({
      fileContent: `{
        "swagger": "2.0",
        "host": "dev.zuplo.com",
        "info": {
          "description": "Zuplo's bad API",
          "title": "Do Not Use This API",
          "version": "2015-01-01-preview",
        }
      }`,
      fileExtension: "json",
    });
    assert.isFalse(result);
  });
});
