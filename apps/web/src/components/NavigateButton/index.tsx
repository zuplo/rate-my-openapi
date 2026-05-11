"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import classNames from "classnames";

type Variant = "primary" | "outlined";

const NavigateButton = ({
  label,
  url,
  variant = "outlined",
}: {
  label: string;
  url: string;
  variant?: Variant;
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={classNames(
        "btn mt-auto self-start",
        variant === "primary" ? "btn-primary" : "btn-outlined",
      )}
    >
      <span>{label}</span>
      <ArrowUpRight size={16} weight="regular" />
    </a>
  );
};

export default NavigateButton;
