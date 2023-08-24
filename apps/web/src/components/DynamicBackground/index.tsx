import classNames from "classnames";

const DynamicBackground = ({ score = -1 }) => (
  <div
    role="presentation"
    className={classNames(
      "fixed inset-0 z-[-1] h-full w-full bg-gradient-radial transition-colors",
      {
        "from-blue-100": score === -1,
        "from-green-100": score > 80,
        "from-red-100": score >= 0 && score <= 50,
        "from-yellow-100": score > 50 && score <= 80,
      }
    )}
  />
);

export default DynamicBackground;
