"use client";

import { Check, ShareNetwork, WarningCircle } from "@phosphor-icons/react";
import classNames from "classnames";
import { useState } from "react";

type CopyState = "idle" | "copied" | "error";

const ShareButton = ({
  className = "",
  type = "dark",
}: {
  className?: string;
  type?: "light" | "dark";
}) => {
  const [state, setState] = useState<CopyState>("idle");

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy report URL", err);
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const isCopied = state === "copied";
  const isError = state === "error";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isCopied}
      className={classNames(
        "btn",
        isError
          ? "btn-outlined text-error"
          : isCopied
            ? "btn-outlined text-success"
            : type === "light"
              ? "btn-outlined"
              : "btn-dark",
        className,
      )}
    >
      {isError ? (
        <>
          <WarningCircle size={16} weight="regular" />
          <span>Couldn&apos;t copy — try again</span>
        </>
      ) : isCopied ? (
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
