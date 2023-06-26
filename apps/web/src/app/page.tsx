"use client";

import EmailInput from "@/components/EmailInput";
import FileUpload from "@/components/FileUpload";
import { useState } from "react";

const HomePage = () => {
  const [step, setStep] = useState(1);

  const setNextStep = () => setStep(step + 1);

  return (
    <main className="flex h-[calc(100%-64px)] w-full flex-col items-center justify-center">
      {step === 1 && <FileUpload setNextStep={setNextStep} />}

      {step === 2 && <EmailInput setNextStep={setNextStep} />}

      {step === 3 && (
        <div>
          <p className="mx-auto mb-2 w-[155px] text-3xl after:inline-block after:w-0 after:animate-ellipsis after:overflow-hidden after:align-bottom after:content-['\2026']">
            Analyzing
          </p>
          <p className="text-center text-xl">
            Your report should be ready in a few minutes
          </p>
        </div>
      )}
    </main>
  );
};

export default HomePage;
