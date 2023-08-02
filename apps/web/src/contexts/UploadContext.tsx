"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState,
} from "react";

type UploadContextType = {
  file?: File;
  isLoading: boolean;
  setFile: Dispatch<SetStateAction<File | undefined>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setNextStep: () => void;
  step: number;
};

const UploadContext = createContext<UploadContextType>({
  isLoading: false,
  setFile: () => {},
  setIsLoading: () => {},
  setNextStep: () => {},
  step: 1,
});

const UploadContextProvider = ({ children }: { children: ReactNode }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const setNextStep = () => {
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
        setIsLoading,
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
