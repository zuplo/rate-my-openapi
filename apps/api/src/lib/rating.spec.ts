// import { assert } from "chai";
// import { readFile } from "fs/promises";
// import { join } from "path";
// import { getReport } from "./rating.js";

// describe("Ratings", function () {
//   it("Test rating", async function () {
//     const jsonOpenApiFilePath = process.argv[2];

//     if (!jsonOpenApiFilePath) {
//       console.error("Please provide a JSON OpenAPI file path");
//       process.exit(1);
//     }

//     const path = join(process.cwd(), jsonOpenApiFilePath);
//     const file = await readFile(path);
//     const content = file.toString();

//     const result = await getReport({
//       fileContent: content,
//       fileExtension: "json",
//       reportId: "test",
//       openAPIFilePath: path,
//     });

//     assert.isDefined(result);
//   });
// });
