const getApiFile = async (
  id: string
): Promise<{ title: string; version: string; url: string } | undefined> => {
  try {
    const res = await fetch(
      `${process.env.NODE_ENV === "development" ? "http" : "https"}://${
        process.env.NEXT_PUBLIC_VERCEL_URL
      }/api/file/${id}`
    );

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
