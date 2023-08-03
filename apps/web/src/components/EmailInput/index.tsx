"use client";

import { type FormEvent, useRef, useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

import { useUploadContext } from "@/contexts/UploadContext";

import StepContainer from "@/components/StepContainer";
import FormError from "../FormError";
import LoadingIndicator from "../LoadingIndicator";

const EmailInput = () => {
  const { setNextStep, file } = useUploadContext();

  const [error, setError] = useState<string>();
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const onChange = () => {
    const emailInput = emailInputRef.current;
    setIsValid(!!(emailInput?.value && emailInput?.validity.valid));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    const emailInput = emailInputRef.current;
    if (emailInput && isValid && file) {
      try {
        const formData = new FormData();
        formData.append("emailAddress", emailInput?.value);
        formData.append("apiFile", file);

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
          method: "POST",
          body: formData,
          mode: "no-cors",
        });

        setNextStep();
      } catch (e) {
        console.error((e as Error).message);

        setIsSubmitting(false);
        setError((e as Error).message);
      }
    }
  };

  return (
    <StepContainer step={2}>
      <form onSubmit={onSubmit}>
        <label
          htmlFor="email"
          className="mx-auto mb-6 block max-w-lg text-center text-xl text-gray-600 md:mb-16"
        >
          Enter your email address so we can send your report when it&apos;s
          ready
        </label>
        <div className="relative flex w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md">
          <input
            required
            onChange={onChange}
            type="email"
            ref={emailInputRef}
            placeholder="Enter email here"
            className="w-full border-none bg-transparent pr-3 text-lg outline-none"
          />
          <button
            type="submit"
            className="icon-button-submit"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <LoadingIndicator height={20} width={20} className="text-white" />
            ) : (
              <ChevronRightIcon height={24} width={24} className="text-white" />
            )}
          </button>
        </div>
      </form>
      <FormError error={error} />
    </StepContainer>
  );
};

export default EmailInput;
