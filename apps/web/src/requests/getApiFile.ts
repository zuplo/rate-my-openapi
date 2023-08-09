import { load } from "js-yaml";

const getApiFile = async ({
  id,
  fileExtension,
}: {
  id: string;
  fileExtension: string;
}): Promise<{ title: string; version: string }> => {
  try {
    const downloadUrlRequestl = await fetch(
      (process.env.NEXT_PUBLIC_API_URL as string) +
        `/file/${id}.${fileExtension}`,
    );
    const downloadUrlJson = await downloadUrlRequestl.json();

    const contentRequest = await fetch(downloadUrlJson.publicUrl);

    const contentsJson =
      fileExtension === "json"
        ? await contentRequest.json()
        : load(await contentRequest.text());

    return {
      title: contentsJson?.info?.title,
      version: contentsJson?.info?.version,
    };
  } catch (e) {
    console.error(e);
    return {
      title: "",
      version: "",
    };
  }
};

export default getApiFile;
