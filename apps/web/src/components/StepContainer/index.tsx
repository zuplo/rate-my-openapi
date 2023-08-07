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

  const isCurrentStep = currentStep === step;

  return (
    <div
      className={classNames(
        "col-start-1 row-start-1 w-full transition-opacity",
        {
          "opacity-1": isCurrentStep && !isLoading,
          "opacity-0": (isCurrentStep && isLoading) || !isCurrentStep,
          "pointer-events-none invisible": !isCurrentStep,
        },
      )}
    >
      {children}
    </div>
  );
};

export default StepContainer;
