"use client";

import { PaperPlaneRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { useUploadContext } from "@/contexts/UploadContext";

import StepContainer from "@/components/StepContainer";
import posthog from "posthog-js";
import { API_URL } from "../../utils/env";
import LoadingIndicator from "../LoadingIndicator";

const EmailInput = () => {
  const { setNextStep, file, step: currentStep } = useUploadContext();

  const [error, setError] = useState<string>();
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  const onChange = () => {
    const emailInput = emailInputRef.current;
    setIsValid(!!(emailInput?.value && emailInput?.validity.valid));
  };

  useEffect(() => {
    const defaultValue = localStorage.getItem("lastUsedEmailAddress") || "";
    if (emailInputRef.current) {
      emailInputRef.current.value = defaultValue;
      const emailInput = emailInputRef.current;
      setIsValid(!!(emailInput?.value && emailInput?.validity.valid));
    }
  }, []);

  useEffect(() => {
    if (currentStep === 2) {
      emailInputRef.current?.focus();
    }
  }, [currentStep]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(undefined);

    const emailInput = emailInputRef.current;
    if (emailInput && isValid && file) {
      try {
        const formData = new FormData();
        formData.append("emailAddress", emailInput?.value);
        formData.append("apiFile", file);

        const uploadResponse = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          let message = `Upload failed with status ${uploadResponse.status}. We've been notified and will fix this ASAP.`;
          try {
            const problem = await uploadResponse.json();
            if ("detail" in problem) {
              message = problem.detail;
            }
          } catch {
            // ignore
          }
          setError(message);
          setIsSubmitting(false);
          return;
        }

        localStorage.setItem("lastUsedEmailAddress", emailInput?.value);
        posthog.identify(emailInput?.value);

        setIsSubmitting(false);
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
        <div className="card flex w-full flex-row items-center gap-2 p-2">
          <input
            required
            onChange={onChange}
            type="email"
            ref={emailInputRef}
            placeholder="Enter your email"
            className="text-fg placeholder:text-fg-faint h-9 w-full flex-1 border-none bg-transparent px-2 text-sm outline-none"
          />
          <button
            type="submit"
            className="btn btn-primary btn-icon shrink-0"
            aria-label="Submit email"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <LoadingIndicator height={16} width={16} className="text-white" />
            ) : (
              <PaperPlaneRight size={16} weight="regular" />
            )}
          </button>
        </div>
      </form>
      <p className="text-fg-muted mx-auto mt-5 block max-w-lg text-center text-sm">
        {error ? (
          <span className="text-error">{error}</span>
        ) : isSubmitting ? (
          <span>Uploading your OpenAPI definition…</span>
        ) : (
          <>We&apos;ll email you the report when it&apos;s ready.</>
        )}
      </p>
    </StepContainer>
  );
};

export default EmailInput;
