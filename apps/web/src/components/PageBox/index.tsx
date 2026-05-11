import classNames from "classnames";
import type { ReactNode } from "react";

type PageBoxProps = {
  children: ReactNode;
  className?: string;
  badge?: string;
};

export const PageBox = ({ children, className, badge }: PageBoxProps) => (
  <div
    className={classNames(
      "card hover:shadow-card-hover relative flex flex-col gap-4 transition-shadow",
      className,
    )}
  >
    {badge && (
      <span className="tag tag-accent is-caps absolute -top-2 -right-2">
        {badge}
      </span>
    )}
    {children}
  </div>
);
