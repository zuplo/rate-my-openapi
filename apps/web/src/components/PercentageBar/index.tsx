"use client";

import classNames from "classnames";

const PercentageBar = ({
  percentage,
  colorClass,
  index,
}: {
  percentage: number;
  colorClass: string;
  index: number;
}) => (
  <>
    <div className="mb-3 rounded-sm bg-gray-200 p-1">
      <div
        className={classNames(
          "h-5 rounded-sm duration-300 ease-linear",
          `animate-percentage-${index}`,
          colorClass
        )}
      />
    </div>
    <style jsx>{`
      .animate-percentage-${index} {
        transition-property: width, background;
        animation: percentage-${index} 4s;
        width: ${percentage}%;
      }

      @keyframes percentage-${index} {
        0% {
          width: 0%;
          background-color: ${colorClass};
        }
        100% {
          width: ${percentage}%;
          background-color: ${colorClass};
        }
      }
    `}</style>
  </>
);

export default PercentageBar;
