import classNames from "classnames";

const getScoreTextColor = (score: number) =>
  classNames({
    "text-green-500": score > 80,
    "text-yellow-500": score > 50 && score <= 80,
    "text-red-500": score > 0 && score <= 50,
    "text-gray-400": score === 0,
  });

export default getScoreTextColor;
