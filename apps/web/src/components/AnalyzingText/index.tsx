"use client";

import { useUploadContext } from "@/contexts/UploadContext";
import classNames from "classnames";

const AnalyzingText = () => {
  const { step } = useUploadContext();

  return (
    <div
      className={classNames("max-w-[450px]", {
        block: step === 3,
        hidden: step !== 3,
      })}
    >
      <p className="mx-auto mb-2 w-[155px] text-3xl after:inline-block after:w-0 after:animate-ellipsis after:overflow-hidden after:align-bottom after:content-['\2026']">
        Analyzing
      </p>
      <p className="text-center text-xl">
        Your report should be ready in a few minutes
      </p>
    </div>
  );
};

export default AnalyzingText;
