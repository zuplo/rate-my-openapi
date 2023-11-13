import fs from "fs";

const fsPath = new URL(
  "packages/cli/example-specs/asana.json",
  import.meta.url,
);
const file = await fs.promises.readFile(fsPath);

const blob = new Blob(file, {
  filename: "openapi.json",
});

const body = new FormData();
body.set("file", blob);

const response = await fetch(
  "https://rate-my-openapi-ihngfni2la-uc.a.run.app/bulk",
  {
    method: "POST",
    body,
    headers: {
      authorization: "Bearer zpka_80589ca8daba43a7a6a3efad55e76660_3fbe48f1",
    },
  },
);

console.log(response.status);

const result = await response.text();
console.log(result);
