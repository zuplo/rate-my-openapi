import classNames from "classnames";
import type { ReactNode } from "react";

export const PageBox = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={classNames(
      "relative flex flex-col gap-4 rounded-lg bg-white p-5 shadow-md",
      "after:absolute after:-right-1.5 after:-top-1.5 after:rounded-md after:bg-indigo-700 after:px-3 after:py-2 after:text-xs after:font-medium after:uppercase after:text-white after:content-['New']",
      className,
    )}
  >
    {children}
  </div>
);
