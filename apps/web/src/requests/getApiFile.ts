import getStorageUrl from "@/utils/getStorageUrl";
import { type OpenAPIV3, type OpenAPIV3_1 } from "openapi-types";

const getApiFile = async (
  id: string
): Promise<OpenAPIV3_1.Document | OpenAPIV3.Document | undefined> => {
  try {
    const res = await fetch(getStorageUrl(`${id}.json`));

    if (res.status === 200) {
      return res.json();
    } else {
      throw new Error("API file not found");
    }
  } catch (e) {
    console.error(e);

    return;
  }
};

export default getApiFile;
