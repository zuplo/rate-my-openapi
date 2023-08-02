"use client";

import { useUploadContext } from "@/contexts/UploadContext";
import classNames from "classnames";
import { type ReactNode } from "react";

const StepContainer = ({
  children,
  step,
}: {
  children: ReactNode;
  step: number;
}) => {
  const { step: currentStep, isLoading } = useUploadContext();

  return (
    <div
      className={classNames(
        "col-start-1 row-start-1 w-full transition-opacity",
        {
          "opacity-1": currentStep === step && !isLoading,
          "opacity-0":
            (currentStep === step && isLoading) || currentStep !== step,
          "pointer-events-none invisible": currentStep !== step,
        }
      )}
    >
      {children}
    </div>
  );
};

export default StepContainer;
