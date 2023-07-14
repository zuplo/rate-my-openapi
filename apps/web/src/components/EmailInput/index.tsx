"use client";

import { useUploadContext } from "@/contexts/UploadContext";
import classNames from "classnames";
import { FormEvent, useRef } from "react";

const EmailInput = () => {
  const { step, setNextStep, setIsLoading, file } = useUploadContext();

  const emailInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    e.preventDefault();

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
      }
    }

    setIsLoading(false);
  };

  return (
    <div
      className={classNames("max-w-[450px]", {
        block: step === 2,
        hidden: step !== 2,
      })}
    >
      <form onSubmit={onSubmit}>
        <label htmlFor="email" className="mb-3 block text-xl">
          Enter your email address so we can send your report when it&apos;s
          ready
        </label>
        <div className="flex flex-nowrap gap-3">
          <input
            required
            type="email"
            ref={emailInputRef}
            className="w-full rounded border border-gray-300 bg-gray-200 px-3"
          />
          <button>Submit</button>
        </div>
      </form>
    </div>
  );
};

export default EmailInput;
