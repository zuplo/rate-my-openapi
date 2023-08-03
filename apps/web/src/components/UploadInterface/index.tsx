"use client";

import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DocumentIcon } from "@heroicons/react/24/outline";

import { useUploadContext } from "@/contexts/UploadContext";

import StepContainer from "../StepContainer";
import FormError from "../FormError";

const EXAMPLES: { title: string; slug: string }[] = [
  {
    title: "Stripe",
    slug: "9dda3db0-ed13-4563-a144-835d550f63ad",
  },
  {
    title: "GitHub",
    slug: "7f898483-ba2b-4b17-8278-fc241a6a5c0d",
  },
  {
    title: "Zuplo",
    slug: "934bc050-9590-4496-9433-73deeec452ff",
  },
  {
    title: "Spotify",
    slug: "6fab0561-259a-47c0-b21a-16c02b19fede",
  },
];

const UploadInterface = () => {
  const { setNextStep, setFile, file } = useUploadContext();

  const urlInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } else if (urlInput?.value && urlInput?.validity.valid) {
      let fileUrl: URL | undefined = undefined;
      let fileName: string | undefined = undefined;

      try {
        const file = new URL(urlInput?.value);
        if (
          file.pathname.endsWith(".json") ||
          file.pathname.endsWith(".yml") ||
          file.pathname.endsWith(".yaml")
        ) {
          fileUrl = file;
          fileName = file.pathname.substring(
            file.pathname.lastIndexOf("/") + 1,
          );
        } else {
          throw new Error("File must be JSON or YAML");
        }
      } catch (e) {
        console.error((e as Error).message);
        setError((e as Error).message);
      }

      if (fileUrl && fileName) {
        try {
          const response = await fetch(fileUrl);

          if (response.status !== 200) {
            throw new Error(`Could not fetch file`);
          }

          const blob = await response.blob();

          setFile(
            new File([blob], fileName, {
              type: blob.type,
            }),
          );

          setNextStep();
        } catch (e) {
          console.error((e as Error).message);
          setError((e as Error).message);
        }
      }
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
                Drop your file here
              </p>
              <p className=" text-gray-500">
                We’ll start analysing your API within a blink
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="mx-auto mb-6 max-w-lg text-center text-xl text-gray-600 md:mb-16">
        Drop your spec file, paste a URL to it or paste your whole spec into the
        form below and we’ll analyse it.
      </p>
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

        <input
          ref={fileInputRef}
          onChange={onLocalFileUploadInputChange}
          className="hidden"
          type="file"
          name="drag-upload"
          accept=".json,.yaml,.yml"
        />

        <div className="flex h-[44px]">
          {!isLocalUpload && !file && !isValidUrlInput && (
            <button
              onClick={onLocalFileUploadClick}
              className="mr-2 whitespace-nowrap rounded-lg border border-gray-500 bg-transparent px-3 py-2 text-gray-500 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
            >
              Select a file
            </button>
          )}

          {isValidUrlInput && (
            <button className="icon-button mr-2 bg-gray-200" onClick={onClear}>
              <XMarkIcon height={24} width={24} className="text-gray-500" />
            </button>
          )}

          <button
            type="submit"
            className="icon-button-submit"
            disabled={isLocalUpload ? !file : !isValidUrlInput}
          >
            <ChevronRightIcon height={24} width={24} className="text-white" />
          </button>
        </div>
      </form>
      <FormError error={error} />
      {EXAMPLES.length > 0 && (
        <div className="mt-5 flex flex-col items-center">
          <p className="m-5 text-lg text-gray-400">
            Don&apos;t have an OpenAPI file to analyze? Check out the reports of
            these APIs
          </p>
          <ul className="flex flex-wrap items-center gap-3">
            {EXAMPLES.map((example) => (
              <li key={example.slug}>
                <Link
                  className="block rounded-lg bg-gray-200 p-2 font-medium text-gray-600 transition-colors hover:bg-gray-900 hover:text-white"
                  href={`/report/${example.slug}`}
                >
                  {example.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </StepContainer>
  );
};

export default UploadInterface;
