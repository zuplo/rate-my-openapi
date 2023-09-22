import getScoreTextColor from "@/utils/get-score-test-color";

type ReportSummaryProps = {
  summary: string;
  score: number;
};

const ReportSummary = ({ summary, score }: ReportSummaryProps) => {
  const scoreTextColor = getScoreTextColor(score);
  return (
    <div className="my-10 flex flex-col	overflow-hidden rounded-lg bg-white p-8 shadow-md md:flex-row md:items-start md:p-10 md:pl-0">
      <h3
        className={`mb-6 font-roboto-mono text-xl font-bold uppercase ${scoreTextColor}`}
      >
        Summary (AI Generated)
      </h3>
      <p className="text-base">{summary}</p>
    </div>
  );
};

export default ReportSummary;
