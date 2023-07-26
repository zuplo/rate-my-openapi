// import { type RatingOutput } from "@rate-my-openapi/core";
type RatingOutput = any;

const getReport = async (id: string): Promise<RatingOutput | undefined> => {
  try {
    const res = await fetch(
      `${process.env.NODE_ENV === "development" ? "http" : "https"}://${
        process.env.NEXT_PUBLIC_VERCEL_URL
      }/api/report/${id}`
    );

    if (res.status === 200) {
      return res.json();
    } else {
      throw new Error("Report file not found");
    }
  } catch (e) {
    console.error(e);

    return;
  }
};

export default getReport;
