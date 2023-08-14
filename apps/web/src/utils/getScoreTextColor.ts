import classNames from "classnames";

const getScoreTextColor = (score: number) =>
  classNames({
    "text-green-500": score > 66,
    "text-yellow-500": score > 33 && score <= 66,
    "text-red-500": score > 0 && score <= 33,
    "text-gray-400": score === 0,
  });

export default getScoreTextColor;
