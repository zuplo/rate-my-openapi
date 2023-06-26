import { FormEvent, useRef } from "react";

const EmailInput = ({ setNextStep }: { setNextStep: () => void }) => {
  const emailInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailInput = emailInputRef.current;
    if (emailInput?.value && emailInput?.validity.valid) {
      setNextStep();
    }
  };

  return (
    <div className="max-w-[450px]">
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
