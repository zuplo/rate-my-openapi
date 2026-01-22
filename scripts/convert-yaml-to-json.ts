// loads a file from argv and converts from yaml to json

import { readFile } from "fs/promises";
import { load } from "js-yaml";

const convertYamlToJson = (fileContent: string) => {
  try {
    return JSON.stringify(load(fileContent), null, 2);
  } catch (e) {
    console.error(e);
    return "";
  }
};

(async () => {
  const fileContent = await readFile(process.argv[2], "utf8");
  console.log(convertYamlToJson(fileContent));
})();
