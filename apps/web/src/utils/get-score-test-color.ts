import classNames from "classnames";

const getScoreTextColor = (score: number) =>
  classNames({
    "text-success": score >= 80,
    "text-warning-deep": score >= 50 && score < 80,
    "text-error": score > 0 && score < 50,
    "text-fg-faint": score === 0,
  });

export default getScoreTextColor;
