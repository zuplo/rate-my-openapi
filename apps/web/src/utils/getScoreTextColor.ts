import classNames from "classnames";

const getScoreTextColor = (score: number) =>
  classNames({
    "to-low-light from-low-dark": score > 66,
    "to-mid-light from-mid-dark": score > 33 && score <= 66,
    "to-high-light from-high-dark": score <= 33,
  });

export default getScoreTextColor;
