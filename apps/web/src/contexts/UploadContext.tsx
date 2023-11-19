"use client";

import { useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type UploadContextType = {
  file?: File;
  isLoading: boolean;
  setFile: Dispatch<SetStateAction<File | undefined>>;
  setNextStep: () => void;
  step: number;
};

const UploadContext = createContext<UploadContextType>({
  isLoading: false,
  setFile: () => {},
  setNextStep: () => {},
  step: 1,
});

const UploadContextProvider = ({ children }: { children: ReactNode }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!router) {
      return;
    }

    const currentStep = searchParams.get("step");

    switch (currentStep) {
      case null:
        break;
      case "upload":
        setStep(1);
        break;
      case "email":
        setStep(2);
        break;
      case "analyzing":
        setStep(3);
        break;
    }
  }, [router, searchParams]);

  const setNextStep = () => {
    switch (step) {
      case 1:
        posthog.capture("step_uploaded_file_completed");
        break;
      case 2:
        posthog.capture("step_entered_email_completed");
        break;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(step + 1);
    }, 500);
  };

  return (
    <UploadContext.Provider
      value={{
        file,
        isLoading,
        setFile,
        setNextStep,
        step,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};

const useUploadContext = () => useContext(UploadContext);

export { UploadContext, UploadContextProvider, useUploadContext };
