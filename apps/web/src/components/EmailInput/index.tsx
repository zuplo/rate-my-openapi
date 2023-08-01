"use client";

import { FormEvent, useRef, useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

import { useUploadContext } from "@/contexts/UploadContext";

import StepContainer from "@/components/StepContainer";
import FormError from "../FormError";

const EmailInput = () => {
  const { setNextStep, file } = useUploadContext();

  const [error, setError] = useState<string>();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(undefined);

    const emailInput = emailInputRef.current;
    if (emailInput?.value && emailInput?.validity.valid && file) {
      try {
        const formData = new FormData();
        formData.append("emailAddress", emailInput.value);
        formData.append("apiFile", file);

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
          method: "POST",
          body: formData,
          mode: "no-cors",
        });

        setNextStep();
      } catch (e) {
        console.error((e as Error).message);

        setError((e as Error).message);
      }
    }
  };

  return (
    <StepContainer step={2}>
      <form onSubmit={onSubmit}>
        <label
          htmlFor="email"
          className="mx-auto mb-16 block max-w-lg text-center text-xl text-gray-600"
        >
          Enter your email address so we can send your report when it&apos;s
          ready
        </label>
        <div className="relative flex w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md">
          <input
            required
            type="email"
            ref={emailInputRef}
            placeholder="Enter email here"
            className="w-full border-none bg-transparent pr-3 text-lg outline-none"
          />
          <button type="submit" className="icon-button bg-gray-900">
            <ChevronRightIcon height={24} width={24} className="text-white" />
          </button>
        </div>
      </form>
      <FormError error={error} />
    </StepContainer>
  );
};

export default EmailInput;
