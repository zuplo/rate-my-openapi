import PercentageBar from "@/components/PercentageBar";
import { Fragment } from "react";

const DUMMY_RATING = 35;

const DUMMY_BREAKDOWN_DATA = [
  {
    title: "Documentation",
    score: 90,
    color: "bg-green-600",
  },
  {
    title: "SDK Generation",
    score: 50,
    color: "bg-yellow-400",
  },
  {
    title: "Mocking",
    score: 30,
    color: "bg-red-600",
  },
];

const DUMMY_DETAILS_DATA = [
  {
    level: "High",
    category: "Documentation",
    description:
      "Missing descriptions. Short uninformative descriptions. No use of markdown.",
  },
  {
    level: "High",
    category: "Mocking",
    description: "No examples.",
  },
  {
    level: "Consider",
    category: "Design",
    description: "Endpoint has incorrect pluralization.",
  },
];

const ReportPage = () => {
  return (
    <>
      <div className="mb-4 flex justify-between">
        <p>
          File name Version 1.2.3{" "}
          <a target="_blank" href="https://www.zuplo.com">
            API document link
          </a>
        </p>
        <button>share your results</button>
      </div>

      <div className="mx-auto mb-8 flex h-[250px] w-[250px] items-center justify-center rounded-full border text-6xl">
        <span>{DUMMY_RATING}</span>
      </div>

      <p className="text-md mb-3">
        Your API spec scored {DUMMY_RATING} out of 100
      </p>
      <h2 className="mb-3 text-2xl">
        Summary: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
        eiusmod.
      </h2>
      <p className="text-md mb-10">
        97th percentile - Your rank 85th out of 3123 OpenAPI docs rated.
      </p>

      <h2 className="mb-3 text-2xl">Breakdown</h2>
      <div className="mb-10">
        {DUMMY_BREAKDOWN_DATA.map((item, index) => (
          <Fragment key={`percentage-bar-${index}`}>
            <h3>
              {item.title} {item.score}%
            </h3>
            <PercentageBar
              percentage={item.score}
              colorClass={item.color}
              index={index}
            />
          </Fragment>
        ))}
      </div>

      <h2 className="mb-3 text-2xl">Details</h2>
      <table className="grid min-w-full border-collapse grid-cols-[minmax(150px,1.2fr)_minmax(150px,1.2fr)_minmax(150px,3.6fr)]">
        <thead className="contents text-left">
          <tr className="contents">
            <th className="border p-2">Level</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Description</th>
          </tr>
        </thead>
        <tbody className="contents">
          {DUMMY_DETAILS_DATA.map((item, index) => (
            <tr className="contents" key={`details-table-row-${index}`}>
              <td className="border p-2">{item.level}</td>
              <td className="border p-2">{item.category}</td>
              <td className="border p-2">{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default ReportPage;
