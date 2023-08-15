"use client";

import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DocumentIcon } from "@heroicons/react/24/outline";

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

  const onDragOver = (e: globalThis.DragEvent) => {
    e.preventDefault();

    setDragActive(true);
  };

  const onDragLeave = (e: globalThis.DragEvent) => {
    e.preventDefault();

    setDragActive(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement> | globalThis.DragEvent) => {
    e.preventDefault();

    setDragActive(false);

    if (e.dataTransfer?.files.length) {
      onLocalFileUpload(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    window.addEventListener("dragover", onDragOver, false);
    window.addEventListener("dragleave", onDragLeave, false);
    window.addEventListener("drop", onDrop, false);

    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.addEventListener("dragleave", onDragLeave, false);
      window.removeEventListener("drop", onDrop);
    };
  });

  const onLocalFileUpload = (newFile: File) => {
    if (
      newFile.type === "application/json" ||
      newFile.type === "application/x-yaml"
    ) {
      setFile(newFile);
      setError(undefined);
      setIsLocalUpload(true);

      // Timeout used to avoid a bit of a race condition with
      // button being disabled
      setTimeout(() => submitButtonRef.current?.focus(), 50);
    } else {
      setError("File must be JSON or YAML");
    }
  };

  const onLocalFileUploadClick = () => {
    fileInputRef.current?.click();
  };

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

    const isValidFileExtension =
      fileName.endsWith(".json") ||
      fileName.endsWith(".yml") ||
      fileName.endsWith(".yaml");

    if (fileName.indexOf(".") !== -1 && !isValidFileExtension) {
      setError("File must be JSON or YAML");
      return;
    }

    try {
      const response = await fetch(fileUrl);

      if (response.status !== 200) {
        throw new Error(`Could not fetch OpenAPI file from ${fileUrl}`);
      }

      const blob = await response.blob();

      setFile(
        new File([blob], fileName, {
          type: blob.type,
        }),
      );

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
        <div className="absolute left-0 top-0 z-10 h-full w-full px-[10%] py-[30%] md:py-[10%]">
          <div className="flex h-full w-full items-center justify-center rounded-lg border-4 border-dashed border-blue-400 bg-[#F8FAFC]/50 backdrop-blur-[1px]">
            <div className="w-full max-w-[240px] rounded-lg bg-white px-5 py-10 text-center shadow-md">
              <DocumentIcon
                height={80}
                width={80}
                className="mx-auto mb-5 text-gray-500"
              />

              <p className="text-xl font-bold text-gray-500">
                Drop your OpenAPI here
              </p>
            </div>
          </div>
        </div>
      )}

      <form
        className="relative flex w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md"
        id="upload-form"
        onSubmit={onSubmit}
      >
        <input
          type="url"
          ref={urlInputRef}
          onChange={onInputChange}
          className="w-full border-none bg-transparent pr-3 text-lg outline-none"
          placeholder={
            !isLocalUpload
              ? "Drop your OpenAPI file or enter your OpenAPI file URL here"
              : ""
          }
          aria-label="Enter OpenAPI file URL here"
          disabled={!!file}
        />

        <input
          ref={fileInputRef}
          onChange={onLocalFileUploadInputChange}
          className="hidden"
          type="file"
          name="drag-upload"
          accept=".json,.yaml,.yml"
        />

        {isLocalUpload && (
          <button
            onClick={onClear}
            className="absolute flex items-center rounded-lg bg-gray-200 p-2 text-lg hover:bg-gray-300"
          >
            <DocumentIcon
              height={24}
              width={24}
              className="mr-1 text-gray-900"
            />
            <span>{file?.name}</span>
            <XMarkIcon height={24} width={24} className="ml-3 text-gray-900" />
          </button>
        )}

        <div className="flex h-[44px]">
          {!isLocalUpload && !file && !isValidUrlInput && (
            <button
              onClick={onLocalFileUploadClick}
              type="button"
              className="mr-2 whitespace-nowrap rounded-lg border border-gray-500 bg-transparent px-3 py-2 text-gray-500 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
            >
              Select a file
            </button>
          )}

          {isValidUrlInput && (
            <button
              className="icon-button mr-2 bg-gray-200 hover:bg-gray-300"
              onClick={onClear}
            >
              <XMarkIcon height={24} width={24} className="text-gray-500" />
            </button>
          )}

          <button
            type="submit"
            ref={submitButtonRef}
            className="icon-button-submit"
            disabled={isLocalUpload ? !file : !isValidUrlInput}
          >
            <ChevronRightIcon height={24} width={24} className="text-white" />
          </button>
        </div>
      </form>
      <FormError error={error} />
      <RatingExamples>
        <div className="m-5 text-center text-lg text-gray-400">
          <p>Don&apos;t have an OpenAPI file to analyze?</p>
          <p> Check out the reports of other APIs</p>
        </div>
      </RatingExamples>
    </StepContainer>
  );
};

export default UploadInterface;
