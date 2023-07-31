"use client";

import { useState } from "react";

const ShareButton = ({ className = "" }) => {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        setCopied(true);
        navigator.clipboard.writeText(window.location.href);
        setTimeout(() => setCopied(false), 5000);
      }}
      className={`button-dark ${className}`}
    >
      {copied ? "Link copied to clipboard" : "Share these results"}
    </button>
  );
};

export default ShareButton;
