"use client";

import { useState } from "react";

const ShareButton = ({
  className = "",
  type,
}: {
  className?: string;
  type?: "light" | "dark";
}) => {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        setCopied(true);
        navigator.clipboard.writeText(window.location.href);
        setTimeout(() => setCopied(false), 2000);
      }}
      disabled={copied}
      className={`${
        copied
          ? "button bg-gray-400 text-white"
          : type === "light"
            ? "button-light"
            : "button-dark"
      } ${className}`}
    >
      {copied ? "Copied to clipboard" : "Share these results"}
    </button>
  );
};

export default ShareButton;
