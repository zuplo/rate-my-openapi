"use client";

import { Check, ShareNetwork } from "@phosphor-icons/react";
import classNames from "classnames";
import { useState } from "react";

const ShareButton = ({
  className = "",
  type = "dark",
}: {
  className?: string;
  type?: "light" | "dark";
}) => {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setCopied(true);
        navigator.clipboard.writeText(window.location.href);
        setTimeout(() => setCopied(false), 2000);
      }}
      disabled={copied}
      className={classNames(
        "btn",
        copied
          ? "btn-outlined text-success"
          : type === "light"
            ? "btn-outlined"
            : "btn-dark",
        className,
      )}
    >
      {copied ? (
        <>
          <Check size={16} weight="regular" />
          <span>Copied to clipboard</span>
        </>
      ) : (
        <>
          <ShareNetwork size={16} weight="regular" />
          <span>Share these results</span>
        </>
      )}
    </button>
  );
};

export default ShareButton;
