import classNames from "classnames";
import AnimatedScore from "../AnimatedScore";

// import { type SpectralReport } from "@rate-my-openapi/core";
type SpectralReport = any;

const SEVERITY_LEVEL_MAP: Record<number, string> = {
  0: "critical",
  1: "high",
  2: "mid",
  3: "low",
};

const getSeverityTextColor = (severity: number) =>
  classNames({
    "text-red-600": severity === 0,
    "text-orange-500": severity === 1,
    "text-yellow-400": severity === 2,
    "text-green-600": severity === 3,
  });

const getScoreTextColor = (score: number) =>
  classNames({
    "text-green-600": score > 66,
    "text-yellow-400": score > 33 && score <= 66,
    "text-red-600": score <= 33,
  });

const ScoreDetailsSection = ({
  title,
  score,
  issues,
}: {
  title: string;
  score: number;
  issues: SpectralReport;
}) => {
  const scoreTextColor = getScoreTextColor(score);
  const titleSlug = title.toLowerCase().replace(" ", "-");

  return (
    <div className="text-red mb-10 flex rounded-lg bg-white py-10 pr-5 shadow-md">
      <div className="flex basis-1/4 flex-col items-center justify-center">
        <h3 className={`mb-6 font-bold uppercase ${scoreTextColor}`}>
          {title}
        </h3>
        <AnimatedScore score={score} className="text-7xl" id={titleSlug} />
      </div>
      <div className="basis-3/4">
        <p className="mb-10 text-xl">
          {issues.length} issues found. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit, sed do eiusmod.
        </p>
        <table className="grid min-w-full border-collapse grid-cols-[minmax(100px,0.5fr)_minmax(100px,4fr)] gap-2">
          <thead className="contents text-left font-bold uppercase">
            <tr className="contents">
              <th>Severity</th>
              <th>Suggestion</th>
            </tr>
          </thead>
          <tbody className="contents">
            {issues
              .slice(0, 5)
              .map(
                (
                  issue: { severity: number; message: string; path: string[] },
                  index: number
                ) => (
                  <tr
                    className="contents"
                    key={`${titleSlug}-table-row-${index}`}
                  >
                    <td
                      className={`font-bold uppercase ${getSeverityTextColor(
                        issue.severity
                      )}`}
                    >
                      {SEVERITY_LEVEL_MAP[issue.severity]}
                    </td>
                    <td>
                      <span className="block">{issue.message}</span>
                      <span className="block">{issue.path?.join(" -> ")}</span>
                    </td>
                  </tr>
                )
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreDetailsSection;
