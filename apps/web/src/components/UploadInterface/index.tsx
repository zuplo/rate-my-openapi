"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FileArrowUp,
  FileText,
  Paperclip,
  PaperPlaneRight,
  X,
} from "@phosphor-icons/react";

import { useUploadContext } from "@/contexts/UploadContext";

import StepContainer from "../StepContainer";
import FormError from "../FormError";
import { RatingExamples } from "../RatingExamples";

const UploadInterface = () => {
  const { setNextStep, setFile, file } = useUploadContext();

  const urlInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isValidUrlInput, setIsValidUrlInput] = useState(false);
  const [isLocalUpload, setIsLocalUpload] = useState(false);

  const onLocalFileUpload = useCallback(
    (newFile: File) => {
      setFile(newFile);
      setError(undefined);
      setIsLocalUpload(true);
      setTimeout(() => submitButtonRef.current?.focus(), 50);
    },
    [setFile],
  );

  useEffect(() => {
    const onDragOver = (e: globalThis.DragEvent) => {
      e.preventDefault();
      setDragActive(true);
    };
    const onDragLeave = (e: globalThis.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
    };
    const onDrop = (e: globalThis.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer?.files.length) {
        onLocalFileUpload(e.dataTransfer.files[0]);
      }
    };

    window.addEventListener("dragover", onDragOver, false);
    window.addEventListener("dragleave", onDragLeave, false);
    window.addEventListener("drop", onDrop, false);

    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [onLocalFileUpload]);

  const onLocalFileUploadInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onLocalFileUpload(e.target.files[0]);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    const urlInput = urlInputRef.current;

    if (file) {
      return setNextStep();
    }

    if (!urlInput?.value || !urlInput?.validity.valid) {
      return;
    }

    const fileUrl = new URL(urlInput?.value);
    const fileName = fileUrl.pathname.substring(
      fileUrl.pathname.lastIndexOf("/") + 1,
    );

    try {
      const response = await fetch(fileUrl);
      if (response.status !== 200) {
        throw new Error(`Could not fetch OpenAPI file from ${fileUrl}`);
      }
      const blob = await response.blob();
      setFile(new File([blob], fileName, { type: blob.type }));
      setNextStep();
    } catch (e) {
      console.error(
        (e as Error).message + ". Does your URL have CORS enabled?",
      );
      setError((e as Error).message + ". Does your URL have CORS enabled?");
    }
  };

  const onClear = () => {
    setFile(undefined);
    setError(undefined);
    setIsLocalUpload(false);
    if (urlInputRef.current) {
      urlInputRef.current.value = "";
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsValidUrlInput(false);
  };

  const onInputChange = () => {
    setError(undefined);
    const isValid =
      urlInputRef.current?.value &&
      urlInputRef.current?.value !== "" &&
      urlInputRef.current?.validity.valid;
    setIsValidUrlInput(!!isValid);
  };

  return (
    <StepContainer step={1}>
      {dragActive && (
        <div className="bg-bg/60 fixed inset-0 z-30 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="border-accent bg-bg shadow-pop flex w-full max-w-md flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center">
            <span className="bg-accent-light text-accent mb-4 grid h-14 w-14 place-items-center rounded-full">
              <FileArrowUp size={28} weight="regular" />
            </span>
            <p className="font-display text-fg text-base font-semibold">
              Drop your OpenAPI 3.x file here
            </p>
            <p className="text-fg-muted mt-1 text-sm">
              JSON or YAML — we&apos;ll take it from here.
            </p>
          </div>
        </div>
      )}
      <form
        className="card flex w-full flex-row items-center gap-2 p-2"
        id="upload-form"
        onSubmit={onSubmit}
      >
        <div className="flex w-full items-center gap-2">
          {!isLocalUpload && !file && (
            <label
              title="Select OpenAPI file"
              role="button"
              className="btn btn-ghost btn-icon shrink-0"
              tabIndex={0}
            >
              <Paperclip size={18} weight="regular" />
              <input
                ref={fileInputRef}
                onChange={onLocalFileUploadInputChange}
                className="hidden h-0 w-0"
                type="file"
                id="drag-upload"
                accept=".json,.yaml,.yml"
              />
            </label>
          )}

          {!isLocalUpload ? (
            <input
              autoFocus
              type="url"
              ref={urlInputRef}
              onChange={onInputChange}
              className="text-fg placeholder:text-fg-faint h-9 w-full flex-1 border-none bg-transparent px-1 text-sm outline-none"
              placeholder="Drop a file or paste your OpenAPI URL"
              aria-label="Enter OpenAPI 3.x file URL here"
              disabled={!!file}
            />
          ) : (
            <button
              type="button"
              onClick={onClear}
              className="bg-bg-muted text-fg hover:bg-border inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors"
            >
              <FileText size={16} weight="regular" />
              <span className="max-w-[170px] overflow-hidden whitespace-nowrap md:max-w-[500px]">
                {file?.name}
              </span>
              <X size={14} weight="regular" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isValidUrlInput && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear URL"
              className="btn btn-ghost btn-icon shrink-0"
            >
              <X size={16} weight="regular" />
            </button>
          )}

          <button
            type="submit"
            ref={submitButtonRef}
            className="btn btn-primary btn-icon shrink-0"
            aria-label="Submit OpenAPI file"
            disabled={isLocalUpload ? !file : !isValidUrlInput}
          >
            <PaperPlaneRight size={16} weight="regular" />
          </button>
        </div>
      </form>
      <FormError error={error} />
      <RatingExamples />
    </StepContainer>
  );
};

export default UploadInterface;
