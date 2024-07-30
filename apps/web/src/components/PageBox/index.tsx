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
      "relative flex flex-col gap-4 rounded-lg bg-white p-8 shadow-md",
      "after:absolute after:-right-1.5 after:-top-1.5 after:rounded-md after:bg-green-500 after:px-2 after:py-1.5 after:text-xs after:font-medium after:uppercase after:text-white after:content-['New']",
      className,
    )}
  >
    {children}
  </div>
);
